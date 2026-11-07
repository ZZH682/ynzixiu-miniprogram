#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
schema 生成器：单一数据源 -> 两套方言 DDL

原始基线：ynzixiu-server/sql/schema.mysql.sql（MySQL 8.0，32 张表）
输出：
  src/main/resources/db/h2/schema.sql     本地开发用（H2 MySQL 兼容模式）
  src/main/resources/db/mysql/schema.sql   生产用（MySQL 8.0）

为什么要生成而不是手写两份：
  1. 避免两套 DDL 漂移（改字段漏改一处 = 线上事故）
  2. MySQL / H2 在 TEXT、TINYINT、KEY 内联索引、COMMENT 上语法不同，集中收敛
  3. 表结构是"业务契约"，必须唯一

用法：python tools/gen_schema.py
"""
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, '..', 'ynzixiu-server', 'sql', 'schema.mysql.sql')
OUT_H2 = os.path.join(BASE, 'src', 'main', 'resources', 'db', 'h2', 'schema.sql')
OUT_MYSQL = os.path.join(BASE, 'src', 'main', 'resources', 'db', 'mysql', 'schema.sql')

# Java 版相对原 Node 版的表结构扩展。
# 这些列不是"随便加的"，每一条都对应一个具体的技术需求：
EXTRA_COLUMNS = {
    'courses': [
        # 库存：用于演示乐观扣减防超卖（SELECT stock ... WHERE stock >= qty）
        {'name': 'stock', 'type': 'INT', 'default': '100', 'nullable': True, 'auto': False,
         'primary': False, 'unique': False},
    ],
    'orders': [
        # 版本号：用于 MyBatis-Plus 乐观锁，演示 CAS 更新订单状态
        {'name': 'version', 'type': 'INT', 'default': '0', 'nullable': True, 'auto': False,
         'primary': False, 'unique': False},
        # 幂等键：同一业务请求重复提交时靠它去重
        {'name': 'request_id', 'type': 'VARCHAR(64)', 'default': None, 'nullable': True, 'auto': False,
         'primary': False, 'unique': False},
    ],
    'groups': [
        # 拼团成团标记：满员后从 forming 流转到 success
        {'name': 'version', 'type': 'INT', 'default': '0', 'nullable': True, 'auto': False,
         'primary': False, 'unique': False},
    ],
}
EXTRA_INDEXES = {
    'orders': [('idx_orders_request_id', ['request_id'])],
}


def parse_mysql_schema(path):
    """解析 MySQL DDL -> [{name, columns:[...], indexes:[...]}]"""
    with open(path, encoding='utf-8') as f:
        text = f.read()
    # 去掉行注释
    text = re.sub(r'--[^\n]*', '', text)

    tables = []
    for m in re.finditer(r'CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\((.*?)\)\s*ENGINE', text, re.S):
        name = m.group(1)
        body = m.group(2)
        columns, indexes = [], []
        for raw in body.split('\n'):
            line = raw.strip().rstrip(',')
            if not line:
                continue
            if line.upper().startswith('KEY '):
                # KEY idx_name (col1, col2)
                parts = line.split(None, 2)
                idx_name = parts[1]
                cols = parts[2].strip().strip('()')
                indexes.append((idx_name, [c.strip() for c in cols.split(',')]))
                continue
            if line.upper().startswith(('PRIMARY KEY', 'UNIQUE KEY', 'CONSTRAINT', 'FOREIGN KEY')):
                continue
            cols = parse_column(line)
            if cols:
                columns.append(cols)
        tables.append({'name': name, 'columns': columns, 'indexes': indexes})
    # 合并 Java 版扩展列与索引
    for t in tables:
        for extra in EXTRA_COLUMNS.get(t['name'], []):
            t['columns'].append(extra)
        t['indexes'].extend(EXTRA_INDEXES.get(t['name'], []))
    return tables


def parse_column(line):
    """解析单列定义 -> dict"""
    # 去掉行内 COMMENT
    line = re.sub(r"\s+COMMENT\s+'[^']*'", '', line, flags=re.I)
    m = re.match(r'^`?(\w+)`?\s+([A-Za-z]+)(\s*\([^)]*\))?(\s+.*)?$', line)
    if not m:
        return None
    col = {
        'name': m.group(1),
        'type': m.group(2).upper(),
        'args': (m.group(3) or '').replace(' ', ''),
        'rest': (m.group(4) or '').strip(),
    }
    col['nullable'] = 'NOT NULL' not in col['rest'].upper()
    col['primary'] = 'PRIMARY KEY' in col['rest'].upper()
    col['auto'] = 'AUTO_INCREMENT' in col['rest'].upper()
    col['unique'] = 'UNIQUE' in col['rest'].upper()
    dm = re.search(r'DEFAULT\s+(\S+)', col['rest'], re.I)
    col['default'] = dm.group(1) if dm else None
    return col


# H2 2.x 的 MySQL 兼容模式下部分列名会与关键字冲突（如 right / name / char / top）。
#
# 解决思路：不改列名、不加引号，而是通过 H2 的 NON_KEYWORDS 连接参数放开这些词。
# 这样做的好处是 —— 加引号会让 MyBatis-Plus 自动生成的 SELECT/INSERT 语句不带引号而查不到列；
# 而 NON_KEYWORDS 对业务代码完全透明，SQL 在 MySQL 生产库上同样能跑（MySQL 这些词本来就不是保留字）。
H2_NON_KEYWORDS = [
    'RIGHT', 'LEFT', 'VALUE', 'KEY', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND',
    'TOP', 'ROLE', 'USER', 'GROUP', 'ORDER', 'SET', 'ROW', 'LEVEL', 'SIZE', 'TYPE',
    'NAME', 'DATE', 'TIME', 'TIMESTAMP', 'END', 'NULL', 'CHAR', 'STATUS', 'COMMENT',
    'INDEX', 'PASSWORD', 'FIRST', 'LAST', 'ACTION', 'CHECK', 'INTERVAL', 'RESULT',
    'SOURCE', 'PATH', 'VERSION', 'LANGUAGE', 'LOCATION', 'OPTION', 'OWNER',
]



def quote_ident(name, dialect):
    """保留字列名加引号：H2 用双引号，MySQL 用反引号"""
    return name


def map_type(col, dialect):
    t, args = col['type'], col.get('args', '')
    if t == 'INT':
        base = 'INT'
    elif t == 'BIGINT':
        base = 'BIGINT'
    elif t == 'VARCHAR':
        base = 'VARCHAR' + args
    elif t == 'TEXT':
        # MySQL 用 TEXT；H2 用 CLOB（H2 2.x 无 TEXT 类型）
        base = 'TEXT' if dialect == 'mysql' else 'CLOB'
    elif t == 'DATETIME':
        base = 'DATETIME' if dialect == 'mysql' else 'TIMESTAMP'
    elif t == 'TINYINT':
        # H2 的 TINYINT 是有符号 1 字节，语义一致；统一用 SMALLINT 更稳
        base = 'TINYINT' if dialect == 'mysql' else 'SMALLINT'
    elif t == 'DECIMAL':
        base = 'DECIMAL' + args
    elif t == 'BIGINT UNSIGNED':
        base = 'BIGINT'
    else:
        base = t + args
    return base


def render(tables, dialect):
    out = []
    out.append('-- ============================================================')
    out.append('-- 云南自修学校 · 五站合一 Java 版后端 表结构')
    out.append('-- 由 tools/gen_schema.py 自动生成，请勿手工修改')
    out.append('-- 方言：' + ('MySQL 8.0' if dialect == 'mysql' else 'H2 2.x (MySQL 兼容模式)'))
    out.append('-- ============================================================')
    out.append('')

    for t in tables:
        out.append('DROP TABLE IF EXISTS %s;' % t['name'])
        out.append('CREATE TABLE IF NOT EXISTS %s (' % t['name'])

        lines = []
        for c in t['columns']:
            seg = '  %s %s' % (quote_ident(c['name'], dialect), map_type(c, dialect))
            if c['auto']:
                # H2 的 MySQL 兼容模式不支持内联 AUTO_INCREMENT，用标准 SQL 的 IDENTITY
                seg += ' GENERATED BY DEFAULT AS IDENTITY' if dialect == 'h2' else ' AUTO_INCREMENT'
            if c['primary']:
                seg += ' PRIMARY KEY'
            elif not c['nullable']:
                seg += ' NOT NULL'
            if c['unique'] and not c['primary']:
                seg += ' UNIQUE'
            if c['default'] is not None and c['default'].upper() not in ('CURRENT_TIMESTAMP',):
                seg += ' DEFAULT %s' % c['default']
            lines.append(seg)

        if dialect == 'mysql':
            # MySQL 支持内联 KEY 索引
            for idx_name, cols in t['indexes']:
                lines.append('  KEY %s (%s)' % (idx_name, ', '.join(cols)))
        else:
            # H2 不支持内联 KEY，统一用独立 CREATE INDEX
            # 注意：索引注释必须放在 CREATE TABLE 之外，否则会被当成"最后一列"留下悬空逗号
            for idx_name, cols in t['indexes']:
                out.append('-- idx: %s (%s)' % (idx_name, ', '.join(cols)))
        out.append(',\n'.join(lines))
        out.append(');')
        out.append('')

        if dialect == 'h2':
            for idx_name, cols in t['indexes']:
                out.append('CREATE INDEX IF NOT EXISTS %s ON %s (%s);'
                           % (idx_name, t['name'], ', '.join(quote_ident(c, dialect) for c in cols)))
            out.append('')

    return '\n'.join(out)


def main():
    tables = parse_mysql_schema(SRC)
    print('parsed tables: %d' % len(tables))

    for path, dialect in ((OUT_H2, 'h2'), (OUT_MYSQL, 'mysql')):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(render(tables, dialect))
        print('wrote %s (%s)' % (path, dialect))


if __name__ == '__main__':
    main()
