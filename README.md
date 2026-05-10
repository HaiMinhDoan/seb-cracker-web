# ExamSolver Frontend

Giao diện React TypeScript cho hệ thống giải bài tự động ExamSolver.

## Cài đặt

```bash
npm install
```

## Chạy development

```bash
npm run dev
```

Mặc định chạy tại `http://localhost:5173`.

API được proxy tới `http://localhost:8080` (cấu hình trong `vite.config.ts`).

## Build production

```bash
npm run build
```

## Cấu hình API

Sửa `vite.config.ts` để đổi target proxy sang production server:

```ts
proxy: {
  '/api': {
    target: 'http://171.244.142.43/api', // production
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  }
}
```

Hoặc tạo file `.env`:

```
VITE_API_BASE_URL=http://your-server/api
```

## Cấu trúc

```
src/
├── components/
│   ├── auth/          # Login, Register
│   ├── layout/        # DashboardLayout (sidebar)
│   ├── solve/         # SolvePage, JobsPage
│   ├── sessions/      # SessionsPage
│   ├── dashboard/     # ProfilePage
│   └── admin/         # Customers, Prompts, QuestionBank
├── services/          # API calls (axios)
├── store/             # Zustand state (auth)
├── types/             # TypeScript interfaces
└── index.css          # Tailwind + CSS variables
```

## Tính năng

- **Giải bài**: Nhập câu hỏi + lựa chọn, gửi và tự động poll kết quả
- **Lịch sử jobs**: Xem trạng thái, đáp án, nguồn (BANK/AI)
- **Phiên thi**: Xem các phiên làm bài, chi tiết từng câu
- **Hồ sơ**: Thông tin tài khoản, AI mode, hạn sử dụng
- **Admin - Khách hàng**: Bật/tắt AI mode, khoá/mở tài khoản, gia hạn
- **Admin - Prompt AI**: Quản lý versions prompt, activate/rollback
- **Admin - Ngân hàng câu hỏi**: Tìm kiếm, xác nhận đáp án
