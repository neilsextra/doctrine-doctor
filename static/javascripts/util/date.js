Date.prototype.getJulian = function () {
    return (this / 86400000) - (this.getTimezoneOffset() / 1440) + 2440587.5;
}

Date.prototype.toGegorian = function (julian) {

    return (this.getUTCFullYear() + "-" +
        this.getUTCMonth() + "-" +
        this.getUTCDate());
}