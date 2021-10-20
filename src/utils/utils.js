let getElapsed = (from, to) => {
    to = to ? to : new Date();

    let difference = (to.getTime() - from.getTime()) / 1000;

    const _f = (mod) => {
        const _result = difference % mod;
        difference = difference / mod;
        return Math.floor(_result);
    }

    const _s = _f(60);
    const _m = _f(60);
    const _h = _f(24);
    const _d = _f(24);

    return `${_d !== 0 ? `${_d} D${_d > 1 ? "s" : ""} ` : ""}${_h !== 0 ? `${_h} H${_h > 1 ? "s" : ""} ` : ""}${_m !== 0 ? `${_m} M${_m > 1 ? "s" : ""} and ` : ""}${_s !== null ? `${_s} S${_s > 1 ? "s" : ""}` : ""}.`;
}

export { getElapsed }