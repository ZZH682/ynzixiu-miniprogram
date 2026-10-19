const pad = (n) => (n < 10 ? '0' + n : '' + n);

module.exports = {
  // 6800 → "6,800"
  price(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  time(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },

  maskPhone(p) {
    return p ? String(p).replace(/^(\d{3})\d{4}(\d{4})$/, '$1 **** $2') : '';
  },

  clock(sec) {
    return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
  }
};
