var fn = function (exp) {
    return new Function('a, b', 'return ' + exp);
};

var _ = {
    range: function (l, r) {
        var _r = r;
        r = r == null ? l : r;
        l = _r == null ? 0 : l;
        var len = r - l;
        var arr = new Array(len);
        for (var i = 0; i < len; i++) arr[i] = i;
        return arr;
    }
};

var cells = [];

var addCell = function (cell) {
    cells.push(cell);
};

var searchAllCells = function () {
    for (var i = 0; i < cells.length; i++) {
        cells[i].cellClicked();
    }
};

var cell = Vue.extend({
    template: '#calendar-cell_',
    data: function () {
        addCell(this);
        return {
            isSearching: false,
            options: null
        }
    },
    props: {
        hour: Number,
        day: String
    },
    methods: {
        cellClicked: function () {
            var alreadySearching = this.isSearching;
            this.options = null;
            this.isSearching = !alreadySearching;
            if (!alreadySearching) {
                // Simulate an AJAX request:
                var self = this;
                self.isSearching = true;
                setTimeout(function () {
                    self.isSearching = false;
                    self.options = Math.floor(Math.random() * 5);
                }, Math.floor(Math.random() * 500));
            }
        }
    },
    computed: {
        showTime: function () {
            return !this.isSearching && this.options === null;
        },
        showSearchResults: function () {
            return !this.isSearching && this.options !== null;
        },
        classList: function () {
            return {
                'goodresults': this.options > 3,
                'weakresults': this.options >= 1 && this.options <= 3,
                'badresults': this.options === 0,
                'searching': this.isSearching
            }
        }
    }
});

Vue.component('calendar', {
    template: '#calendar_',
    data: function () {
        return {
            hours: _.range(24),
            days: _.range(1, 32).map(fn("'Oct ' + a")),
            isLoaded: false
        }
    },
    methods: {
        load: function () {
            this.isLoaded = true;
        },
        searchAll: function () {
            searchAllCells();
        },
        dayHeaderClicked: function () {
            alert('dayHeaderClicked()');
        }
    },
    components: {
        'calendar-cell': cell
    }
});

var app = new Vue({
    el: 'body'
});
