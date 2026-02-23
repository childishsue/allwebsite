document.addEventListener('DOMContentLoaded', () => {
  const app = Vue.createApp({
    data() {
      return {
        isPasswordVisible1: false,
        isPasswordVisible2: false,
        currentIndex: null,
        isFilterListVisible: false,
        currentFilter: 'week',
        filterLabel: '當週',
        historyList: [
          { orderNum: 'abc123', sellDate: '2021-09-02', matchDate: '2021-09-03', status: '成功' },
          { orderNum: 'abc123', sellDate: '2021-09-02', matchDate: '2021-09-03', status: '失敗' },
          { orderNum: 'abc123', sellDate: '2021-09-02', matchDate: '2021-09-03', status: '待確認' },
          { orderNum: 'abc123', sellDate: '2021-09-02', matchDate: '2021-09-03', status: '成功' },
          { orderNum: 'abc123', sellDate: '2021-09-02', matchDate: '2021-09-03', status: '成功' },
          { orderNum: 'abc123', sellDate: '2021-09-02', matchDate: '2021-09-03', status: '成功' },
        ],
        trades: [
          { date: '2021-09-02', status: '成功', income: '$250' },
          { date: '2021-09-02', status: '失敗', income: '$250' },
          { date: '2021-09-03', status: '待確認', income: '$250' },
          { date: '2021-09-03', status: '成功', income: '$250' },
          { date: '2021-09-03', status: '成功', income: '$250' },
          { date: '2021-09-03', status: '成功', income: '$250' },
          { date: '2021-09-03', status: '成功', income: '$250' }
        ],
        data: {
          week: [
            { date: '2021-08-31', orderId: 'abc100456', income: '$250' },
            { date: '2021-09-01', orderId: 'abc100457', income: '$250' },
            { date: '2021-09-01', orderId: 'abc100457', income: '$250' },
            { date: '2021-09-01', orderId: 'abc100457', income: '$250' },
            { date: '2021-09-01', orderId: 'abc100457', income: '$250' },
            { date: '2021-09-01', orderId: 'abc100457', income: '$250' },
            { date: '2021-09-01', orderId: 'abc100457', income: '$250' },
          ],
          month: [
            { date: '2021-08-31', orderId: 'abc100456', income: '$250' },
            { date: '2021-09-01', orderId: 'abc100457', income: '$250' },
          ],
          season: [
            { date: '2021-08-31', orderId: 'abc100456', income: '$250' },
          ]
        }
      };
    },

    computed: {
      passwordIcon1() {
        return this.isPasswordVisible1
          ? '../assets/img/icon/eye1.png'
          : '../assets/img/icon/eye2.png';
      },

      passwordIcon2() {
        return this.isPasswordVisible2
          ? '../assets/img/icon/eye1.png'
          : '../assets/img/icon/eye2.png';
      },

      filteredData() {
        return this.data[this.currentFilter];
      },

      totalIncomeWithStatus() {
        const total = this.trades.reduce((total, trade) => {
          if (trade.status === '成功') {
            return total + parseFloat(trade.income.slice(1));
          }
          return total;
        }, 0);
        return `$${total.toFixed(2)}`;
      },

      totalIncome() {
        const total = this.filteredData.reduce((total, item) => total + parseFloat(item.income.slice(1)), 0);
        return `$${total.toFixed(2)}`;
      }
    },

    methods: {
      getStatusClass(status) {
        switch (status) {
          case '成功':
            return 'success';
          case '失敗':
            return 'false';
          case '待確認':
            return 'tobeconfirmed';
          default:
            return '';
        }
      },

      copyLink() {
        const linkToCopy = this.$refs.linkToCopy.textContent;
        navigator.clipboard.writeText(linkToCopy)
          .then(() => {
            alert('連結已複製');
          })
          .catch(err => {
            console.error('複製失敗', err);
          });
      },

      togglePwd1() {
        this.isPasswordVisible1 = !this.isPasswordVisible1;
        const passwordField1 = this.$refs.passwordField1;
        passwordField1.type = this.isPasswordVisible1 ? 'text' : 'password';
      },

      togglePwd2() {
        this.isPasswordVisible2 = !this.isPasswordVisible2;
        const passwordField2 = this.$refs.passwordField2;
        passwordField2.type = this.isPasswordVisible2 ? 'text' : 'password';
      },

      toggleContent(index) {
        this.currentIndex = this.currentIndex === index ? null : index;
      },

      toggleFilterList() {
        this.isFilterListVisible = !this.isFilterListVisible;
      },

      setFilter(filter, label) {
        this.currentFilter = filter;
        this.filterLabel = label;
        this.isFilterListVisible = false;
      },

      handleClickOutside(event) {
        const filterBtn = this.$refs.filterBtn;
        const filterList = this.$refs.filterList;
        if (!filterBtn.contains(event.target) && !filterList.contains(event.target)) {
          this.isFilterListVisible = false;
        }
      }
    },
    mounted() {
      document.addEventListener('click', this.handleClickOutside);
    },

    beforeUnmount() {
      document.removeEventListener('click', this.handleClickOutside);
    }
  });

  app.mount('#vFunction');
});