import java.util.Arrays;
import java.util.Objects;
import java.util.function.Supplier;

/** 参考答案：先自己写完 Drill.java 再对照。运行后应为 35/35 全通过。 */
public class Answer {

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

    static Integer payAmount(Integer amount, Integer paid, String plan) {
        int a = amount == null ? 0 : amount;
        int p = paid == null ? 0 : paid;
        if (!"installment".equals(plan)) {
            return a;
        }
        if (p <= 0) {
            return (int) Math.ceil(a * 30 / 100.0);
        }
        return Math.max(0, a - p);
    }

    static String normalize(String raw) {
        if (raw == null) {
            return "";
        }
        char[] cs = raw.replaceAll("\\s+", "").toUpperCase().toCharArray();
        Arrays.sort(cs);
        return new String(cs);
    }

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

        int remain() {
            return Math.max(0, amount - paid);
        }

        boolean pay(int money) {
            if (money <= 0 || "paid".equals(status)) {
                return false;
            }
            paid += money;
            status = paid >= amount ? "paid" : "part_paid";
            return true;
        }

        boolean isPaid() {
            return "paid".equals(status);
        }
    }

    static int payAmountV2(int amount, int paid, String plan) {
        if ("installment".equals(plan) || "deposit".equals(plan)) {
            if (paid <= 0) {
                int ratio = "deposit".equals(plan) ? 20 : 40;
                return (int) Math.ceil(amount * ratio / 100.0);
            }
            return Math.max(0, amount - paid);
        }
        return amount;
    }

    static int countCorrect(String[] chosen, String[] keys) {
        if (chosen == null || keys == null) {
            return 0;
        }
        int len = Math.min(chosen.length, keys.length);
        int n = 0;
        for (int i = 0; i < len; i++) {
            String a = chosen[i];
            String b = keys[i];
            if (a != null && b != null && normalize(a).equals(normalize(b))) {
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
    }
}
