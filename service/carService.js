const BaseRepository = require("../repository/base/baseRepository");
const Tax = require('../src/entities/Tax');
const Transaction = require("../src/entities/Transaction");


class CarService {
    constructor({ cars }) {

        this.carRepository = new BaseRepository({ file: cars });

        this.currencyFormat = (price) => new Intl.NumberFormat('pt-br', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);

        this.taxesBasedOnAge = Tax.taxesBasedOnAge;

    }


    getRandomFromArray(arr) {
        return Math.floor(Math.random() * arr.length)
    }

    chooseRandomCarId(carCategory) {
        const randomCarIndex = this.getRandomFromArray(carCategory.carIds);

        return carCategory.carIds[randomCarIndex];
    }


    async getAvailableCar(carCategory) {
        const carId = this.chooseRandomCarId(carCategory);
        const car = await this.carRepository.find(carId);
        return car;
    }

    async calculateFinalPrice(customer, carCategory, numberOfDays) {

        const { age } = customer;

        const { then: tax } = this.taxesBasedOnAge.find(tax => age >= tax.from && age <= tax.to);

        const price = (carCategory.price * tax) * numberOfDays;

        return this.currencyFormat(price);

    }

    async rent(customer, carCategory, numberOfDays) {
        const car = await this.getAvailableCar(carCategory);
        const finalPrice = await this.calculateFinalPrice(customer, carCategory, numberOfDays);
        const date = new Date();
        date.setDate(date.getDate() + numberOfDays)

        const options = {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
        const dueDate = date.toLocaleDateString('pt-BR', options);

        const transaction = new Transaction(
            {
                customer, car, amount: finalPrice, dueDate
            }
        )

        console.log(transaction)
        return transaction;
    }

}

module.exports = CarService;