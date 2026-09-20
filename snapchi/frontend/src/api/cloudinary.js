const MAX_SIDE = 1200;

// Nén/resize ảnh phía client trước khi upload để tiết kiệm quota Cloudinary
export async function compressImage(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Không nén được ảnh'))), 'image/jpeg', 0.8)
  );
}

// Upload thẳng lên Cloudinary bằng unsigned preset, trả về { imageUrl, imagePublicId }
export async function uploadImage(blob) {
  const form = new FormData();
  form.append('file', blob);
  form.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error('Upload ảnh thất bại');
  const data = await res.json();
  return { imageUrl: data.secure_url, imagePublicId: data.public_id };
}

// Thumbnail bằng URL transformation, không cần lưu file riêng
export const thumb = (url, size = 150) =>
  url.replace('/upload/', `/upload/w_${size},h_${size},c_fill/`);
