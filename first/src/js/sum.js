export default function sum(...args) {
    return args.reduce((prev, currentValue) => {
        return prev + currentValue;
    })
}