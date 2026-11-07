#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Entity 生成器：从 schema 解析列定义 -> 生成 MyBatis-Plus 实体类。

为什么用生成器而不是手写 32 个实体：
  1. 字段名/类型必须与表结构严格一致，手写必然漂移
  2. 加字段只需改 schema 再重跑，CI 可校验"生成物与 schema 一致"
  3. 驼峰转换、@TableName 注解等模板统一，避免低级错误

用法：python tools/gen_entity.py
"""
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA = os.path.join(BASE, 'src', 'main', 'resources', 'db', 'h2', 'schema.sql')
OUT_DIR = os.path.join(BASE, 'src', 'main', 'java', 'com', 'ynzx', 'server', 'entity')

# 需要生成的表 -> 实体类名（默认表名转驼峰）
TABLES = {
    'users': 'User',
    'sms_codes': 'SmsCode',
    'businesses': 'Business',
    'banners': 'Banner',
    'courses': 'Course',
    'chapters': 'Chapter',
    'orders': 'Order',
    'payments': 'Payment',
    'group_rules': 'GroupRule',
    'groups': 'GroupInfo',       # groups 与 SQL 关键字冲突，映射到 GroupInfo
    'group_members': 'GroupMember',
    'coupons': 'Coupon',
    'coupon_claims': 'CouponClaim',
    'referrals': 'Referral',
    'withdraws': 'Withdraw',
    'signups': 'Signup',
    'study_progress': 'StudyProgress',
    'questions': 'Question',
    'subjects': 'Subject',
    'quiz_records': 'QuizRecord',
    'error_book': 'ErrorBook',
    'materials': 'Material',
    'material_downloads': 'MaterialDownload',
    'reviews': 'Review',
    'teachers': 'Teacher',
    'campus': 'Campus',
    'stories': 'Story',
    'news': 'News',
    'service_messages': 'ServiceMessage',
    'exam_records': 'ExamRecord',
    'push_logs': 'PushLog',
    'settings': 'Setting',
}

JAVA_TYPES = {
    'INT': 'Integer',
    'BIGINT': 'Long',
    'VARCHAR': 'String',
    'TEXT': 'String',
    'CLOB': 'String',
    'TIMESTAMP': 'LocalDateTime',
    'DATETIME': 'LocalDateTime',
    'TINYINT': 'Integer',
    'SMALLINT': 'Integer',
    'DECIMAL': 'BigDecimal',
}

# Java 关键字：列名撞关键字时，字段名加前缀并用 @TableField 显式映射列名
JAVA_KEYWORDS = {
    'short', 'char', 'int', 'long', 'float', 'double', 'boolean', 'byte',
    'class', 'static', 'final', 'void', 'new', 'this', 'super', 'switch',
    'case', 'default', 'if', 'else', 'for', 'while', 'do', 'return',
    'package', 'import', 'public', 'private', 'protected', 'abstract',
    'interface', 'enum', 'extends', 'implements', 'try', 'catch', 'finally',
    'throw', 'throws', 'instanceof', 'native', 'synchronized', 'transient',
    'volatile', 'strictfp', 'assert', 'break', 'continue', 'goto', 'const',
}


def camel(name):
    parts = name.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


def pascal(name):
    return ''.join(p.capitalize() for p in name.split('_'))


def parse_schema():
    """解析生成的 H2 schema -> {table: [(col, type, nullable)]}"""
    with open(SCHEMA, encoding='utf-8') as f:
        text = f.read()
    tables = {}
    for m in re.finditer(r'CREATE TABLE IF NOT EXISTS (\w+)\s*\((.*?)\n\);', text, re.S):
        name = m.group(1)
        cols = []
        for line in m.group(2).split('\n'):
            line = line.strip().rstrip(',')
            if not line or line.startswith('--'):
                continue
            cm = re.match(r'^(\w+)\s+([A-Z]+)(\s*\([^)]*\))?(.*)$', line)
            if not cm:
                continue
            col, ctype, args, rest = cm.group(1), cm.group(2), cm.group(3) or '', cm.group(4)
            cols.append((col, ctype, 'NOT NULL' in rest.upper()))
        tables[name] = cols
    return tables


def field_name(col):
    """列名 -> Java 字段名；撞关键字时加 _ 前缀"""
    name = camel(col)
    return '_' + name if name in JAVA_KEYWORDS else name


def render(table, cls, cols):
    lines = []
    lines.append('package com.ynzx.server.entity;')
    lines.append('')
    lines.append('import com.baomidou.mybatisplus.annotation.IdType;')
    lines.append('import com.baomidou.mybatisplus.annotation.TableField;')
    lines.append('import com.baomidou.mybatisplus.annotation.TableId;')
    lines.append('import com.baomidou.mybatisplus.annotation.TableName;')
    lines.append('import lombok.Data;')
    lines.append('')
    lines.append('import java.io.Serializable;')
    lines.append('import java.math.BigDecimal;')
    lines.append('import java.time.LocalDateTime;')
    lines.append('')
    lines.append('/**')
    lines.append(' * 数据表 {@code %s} 的实体。' % table)
    lines.append(' * <p>字段由 tools/gen_entity.py 依据 schema 自动生成，请勿手工改动。</p>')
    lines.append(' */')
    lines.append('@Data')
    lines.append('@TableName("%s")' % table)
    lines.append('public class %s implements Serializable {' % cls)
    lines.append('')
    for col, ctype, notnull in cols:
        jtype = JAVA_TYPES.get(ctype, 'String')
        fname = field_name(col)
        lines.append('    /** %s */' % col)
        if fname != camel(col):
            # 撞 Java 关键字：用 @TableField 显式绑定真实列名
            lines.append('    @TableField("%s")' % col)
        if jtype == 'BigDecimal':
            lines.append('    private BigDecimal %s;' % fname)
        elif jtype == 'LocalDateTime':
            lines.append('    private LocalDateTime %s;' % fname)
        elif jtype in ('Integer', 'Long'):
            lines.append('    private %s %s;' % (jtype, fname))
        else:
            lines.append('    private String %s;' % fname)
        lines.append('')
    # 主键标注
    pk = 'id' if any(c[0] == 'id' for c in cols) else ('k' if any(c[0] == 'k' for c in cols) else None)
    if pk:
        pk_field = field_name(pk)
        out = []
        for i, line in enumerate(lines):
            # 只在"字段声明的上一行"插入注解，避免误伤其它以 id 结尾的字段
            if (line.strip().startswith('private ')
                    and line.strip().endswith(' ' + pk_field + ';')
                    and (i == 0 or not lines[i - 1].strip().startswith('@'))):
                out.append('    @TableId(type = IdType.AUTO)')
            out.append(line)
        lines = out
    lines.append('}')
    return '\n'.join(lines) + '\n'


def main():
    tables = parse_schema()
    os.makedirs(OUT_DIR, exist_ok=True)
    count = 0
    for table, cls in TABLES.items():
        if table not in tables:
            print('  SKIP (not in schema):', table)
            continue
        code = render(table, cls, tables[table])
        with open(os.path.join(OUT_DIR, cls + '.java'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(code)
        count += 1
    print('generated %d entities -> %s' % (count, OUT_DIR))


if __name__ == '__main__':
    main()
