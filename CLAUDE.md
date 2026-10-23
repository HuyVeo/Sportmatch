# SportMatch

Dự án clone lại website đặt trận thể thao **SportMatch** (Cầu lông, Pickleball → mở rộng thêm môn sau). Toàn bộ chi tiết dự án đã được tách theo chủ đề trong `.claude/rules/`, tự động nạp theo Claude Code rule spec:

- `project-overview.md` — bối cảnh, ảnh tham chiếu, mục tiêu theo giai đoạn, quy ước làm việc
- `tech-stack.md` — công nghệ đã chốt, cấu trúc thư mục
- `design-system.md` — màu sắc, theme, header, wording
- `data-model.md` — schema đề xuất
- `feature-auth-onboarding.md` — landing, đăng nhập/đăng ký, onboarding
- `feature-discover-map-ranking.md` — khám phá, bản đồ, xếp hạng
- `feature-matches-courts.md` — trận đấu (danh sách + tạo), sân bãi
- `feature-account-social.md` — hồ sơ, cài đặt, chat, thông báo, lịch sử, đánh giá

Không cần đọc lại toàn bộ các file trên thủ công — chúng được nạp tự động (không điều kiện, hoặc theo `paths` khi làm việc trong thư mục liên quan). Khi cần chi tiết UI chính xác, luôn đối chiếu lại ảnh gốc (`*.png` ở thư mục gốc) được liệt kê trong `project-overview.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
