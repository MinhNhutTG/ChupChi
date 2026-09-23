export const PASSWORD_MESSAGE = 'Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số';

export function validPassword(p) {
  return typeof p === 'string' && p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);
}
