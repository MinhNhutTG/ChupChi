# SnapChi

Chạy local (cần MongoDB Atlas, Cloudinary unsigned preset, Google Client ID):

```
cd backend  && cp .env.example .env && npm install && npm run dev   # :4000
cd frontend && cp .env.example .env && npm install && npm run dev   # :5173
```

Quyết định v1: múi giờ cố định UTC+7, chưa có refresh token rotation, email dùng domain test của Resend.
