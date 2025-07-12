const removeVietnameseTones = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};
export default removeVietnameseTones;
