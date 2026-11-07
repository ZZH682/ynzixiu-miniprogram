import java.util.Objects;
import java.util.function.Supplier;

/**
 * Java 基础四练 - 题目版。
 * 素材全部取自 ynzixiu-fullstack 项目真实代码。
 * 只填 TODO 处，不要改 main 里的断言；填完运行 run.bat 看通过率。
 */
public class Drill {

    static int pass = 0;
    static int fail = 0;

    static void check(String name, Object expected, Supplier<Object> body) {
        try {
            Object actual = body.get();
            if (Objects.equals(expected, actual)) {
                pass++;
                System.out.println("  PASS  " + name + "  = " + actual);
            } else {
                fail++;
                System.out.println("  FAIL  " + name + "  期望 " + expected + "，实际 " + actual);
            }
        } catch (Exception e) {
            fail++;
            System.out.println("  FAIL  " + name + "  抛出异常 "
                    + e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }

    /* ================= L1 基础语法 =================
     * 考点：变量、Integer 拆箱与 null、算术与取整、条件判断、循环、参数与返回值
     * 项目原型：OrderService.calculatePayAmount (OrderService.java:177-189)
     */

    /** TODO-1 计算本次应付金额（单位：分）。
     *  full        -> 返回 amount（不看 paid）
     *  installment -> paid<=0 时返回 ceil(amount * 30%)，否则返回 amount - paid（不小于 0）
     *  amount / paid 可能为 null，按 0 处理
     */
    static Integer payAmount(Integer amount, Integer paid, String plan) {
        // TODO: 写你的实现
        return null;
    }

    /** TODO-2 归一化多选答案：去掉空白 -> 转大写 -> 按字符升序排序。
     *  例："ba" -> "AB"，"A C" -> "AC"，null / "" -> ""
     *  项目原型：QuizService.normalize (QuizService.java:234-241)
     */
    static String normalize(String raw) {
        // TODO: 写你的实现（提示：先用循环 / char 数组，别急着抄 Stream 写法）
        return null;
    }

    /* ================= L2 面向对象 =================
     * 考点：类、对象、属性、构造方法、实例方法、状态在对象内部流转
     * 项目原型：entity/Order.java（项目用 Lombok @Data，getter/setter 是编译期生成的）
     */
    static class SimpleOrder {
        private String orderNo;
        private int amount;
        private int paid;
        private String status;

        SimpleOrder(String orderNo, int amount) {
            this.orderNo = orderNo;
            this.amount = amount;
            this.paid = 0;
            this.status = "unpaid";
        }

        String getOrderNo() { return orderNo; }
        int getAmount() { return amount; }
        int getPaid() { return paid; }
        String getStatus() { return status; }

        /** TODO-3a 剩余应付金额 = amount - paid，不小于 0 */
        int remain() {
            return -1; // TODO
        }

        /** TODO-3b 支付：金额 <= 0 或已付清返回 false；否则累加 paid 并更新状态
         *  paid < amount -> "part_paid"；paid >= amount -> "paid"；返回 true
         */
        boolean pay(int money) {
            return false; // TODO
        }

        /** TODO-3c 是否已付清 */
        boolean isPaid() {
            return false; // TODO
        }
    }

    /* ================= L3 读码与修改 =================
     * 下面这段是项目 OrderService.calculatePayAmount 的简化版。
     * 先读懂（口头回答 README 第 5 节三问），再按新需求修改方法体：
     *   1) installment 首付比例由 30% 改为 40%
     *   2) 新增 plan = "deposit"，首付 20%
     *   3) 其余规则不变（full 全额；已付过则付尾款 amount - paid，不小于 0）
     * 不要改方法签名，不要改 main 里的断言。
     */
    static int payAmountV2(int amount, int paid, String plan) {
        if (!"installment".equals(plan)) {
            return amount;
        }
        if (paid <= 0) {
            return (int) Math.ceil(amount * 30 / 100.0);
        }
        return Math.max(0, amount - paid);
    }

    /* ================= L4 排错与验证 =================
     * TODO-4：下面方法有 3 个缺陷，会抛异常或结果不符预期。
     * 按四步做：① 说明现象 ② 写出排查思路 ③ 修复 ④ 用不同输入验证（README 第 6 节有引导）
     * 期望行为：逐题比较 chosen 与 keys，忽略大小写与空白；
     *          长度不等时按较短的长度比较；null 元素或 null 数组都算该题错。
     */
    static int countCorrect(String[] chosen, String[] keys) {
        int n = 0;
        for (int i = 0; i <= chosen.length; i++) {
            if (chosen[i] == keys[i]) {
                n++;
            }
        }
        return n;
    }

    public static void main(String[] args) {
        System.out.println("=== L1 基础语法 ===");
        check("一次付清", 98000, () -> payAmount(98000, 0, "full"));
        check("一次付清不看已付", 50000, () -> payAmount(50000, 20000, "full"));
        check("分期首付 30% 向上取整", 30001, () -> payAmount(100001, 0, "installment"));
        check("分期首付最小边界", 1, () -> payAmount(1, 0, "installment"));
        check("分期尾款", 70000, () -> payAmount(100000, 30000, "installment"));
        check("已付清返回 0", 0, () -> payAmount(100000, 100000, "installment"));
        check("null 金额按 0", 0, () -> payAmount(null, null, "full"));
        check("答案归一化 ba", "AB", () -> normalize("ba"));
        check("答案归一化含空格", "AC", () -> normalize("A C"));
        check("答案归一化 c a", "AC", () -> normalize(" c a "));
        check("答案归一化空", "", () -> normalize(null));

        System.out.println("=== L2 面向对象 ===");
        SimpleOrder o = new SimpleOrder("NO-1", 100000);
        check("订单号", "NO-1", () -> o.getOrderNo());
        check("初始状态", "unpaid", () -> o.getStatus());
        check("初始剩余", 100000, () -> o.remain());
        check("首付 30000", true, () -> o.pay(30000));
        check("首付后状态", "part_paid", () -> o.getStatus());
        check("首付后剩余", 70000, () -> o.remain());
        check("非法金额被拒", false, () -> o.pay(-5));
        check("付尾款", true, () -> o.pay(70000));
        check("付清状态", "paid", () -> o.getStatus());
        check("付清判定", true, () -> o.isPaid());
        check("付清后再付被拒", false, () -> o.pay(1));

        System.out.println("=== L3 读码与修改（新规则）===");
        check("installment 首付改 40%", 40001, () -> payAmountV2(100001, 0, "installment"));
        check("deposit 首付 20%", 20001, () -> payAmountV2(100001, 0, "deposit"));
        check("deposit 尾款", 80000, () -> payAmountV2(100000, 20000, "deposit"));
        check("full 仍全额", 98000, () -> payAmountV2(98000, 0, "full"));
        check("尾款不为负", 0, () -> payAmountV2(100000, 100000, "installment"));

        System.out.println("=== L4 排错与验证 ===");
        check("全对", 2, () -> countCorrect(new String[]{"A", "B"}, new String[]{"A", "B"}));
        check("非字面量字符串也要相等", 1,
                () -> countCorrect(new String[]{new String("A")}, new String[]{new String("A")}));
        check("忽略大小写与空格", 2, () -> countCorrect(new String[]{"a", "B "}, new String[]{"A", "b"}));
        check("有错有对", 1, () -> countCorrect(new String[]{"A", "C"}, new String[]{"A", "B"}));
        check("长度不等按较短", 1, () -> countCorrect(new String[]{"A"}, new String[]{"A", "B"}));
        check("空数组", 0, () -> countCorrect(new String[]{}, new String[]{"A"}));
        check("含 null 元素", 1, () -> countCorrect(new String[]{"A", null}, new String[]{"A", "B"}));
        check("null 数组", 0, () -> countCorrect(null, null));

        System.out.println();
        System.out.println("===== 通过 " + pass + " / " + (pass + fail) + " =====");
        if (fail > 0) {
            System.out.println("还有 " + fail + " 项未通过，继续填 TODO；实在卡住再看 Answer.java");
        } else {
            System.out.println("四项基础全部达标，去 README 第 8 节做口试自检");
        }
    }
}
