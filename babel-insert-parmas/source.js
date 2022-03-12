console.log(11);

function func() {
    console.info(22);
}

export default class Clazz {
    say() {
        console.debug('333');
    }
    render() {
        return <div>{console.error(666666)}</div>
    }
}