class Timer {

    constructor(options) {
        this._result = options.el;
        this._seconds = 0;
    }


    _formattedTime(h, m, s) {
        var H = h < 10 ? '0' + h : h;
        var M = m < 10 ? '0' + m : m;
        var S = s < 10 ? '0' + s : s;

        return `${M}:${S}`;
    }

    _renderTime(totalSeconds) {
        var hours = this._getHours(totalSeconds);
        var minutes = this._getMinutes(totalSeconds);
        var seconds = this._getSeconds(totalSeconds);

        this._result.innerHTML = this._formattedTime(hours, minutes, seconds);
    }


    _getHours(seconds) {
        return parseInt(seconds / 3600) % 24;
    }

    _getMinutes(seconds) {
        return parseInt(seconds / 60) % 60;
    }

    _getSeconds(seconds) {
        return seconds % 60;
    }

    _updateTime() {
        this._seconds += 1;
        this._renderTime(this._seconds);
    }

    stop() {
        clearInterval(this._timerId);
    }

    start() {
        this._timerId = setInterval(() => this._updateTime(), 1000);
    }

}

window.Timer = Timer;
