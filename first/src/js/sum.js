export default function sum(...args) {
    return args.reduce((prev, currentValue, currentIndex, arr) => {
        return prev + currentValue;
    })
}