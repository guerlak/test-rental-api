const { describe, it, before, beforeEach, afterEach } = require('mocha');
const { join } = require('path');
const CarService = require('../../service/carService');
const { expect } = require('chai');
const sinon = require('sinon');

const Transaction = require('../../src/entities/Transaction');
const BaseRepository = require('../../repository/base/baseRepository');

const carsDatabase = join(__dirname, '../../database', 'cars.json');

const mocks = {
    validCar: require('../../mocks/valid-car.json'),
    validCarCategory: require('../../mocks/valid-carCategory.json'),
    validCustomer: require('../../mocks/valid-customer.json'),
}

describe('CarService Suite Test', () => {
    let carService = {};
    let sandBox = {};

    before(() => {
        carService = new CarService({
            cars: carsDatabase
        })
    })

    beforeEach(() => {
        sandBox = sinon.createSandbox()
    })

    afterEach(() => {
        sandBox.restore();
    })

    it('should get a random position form an array', () => {
        const data = [0, 1, 2, 3, 4]
        const result = carService.getRandomFromArray(data);
        expect(result).to.be.lte(data.length).and.be.gte(0);
    })

    it('should choose the first id from carIds in carCategory', () => {
        const carCategory = mocks.validCarCategory;
        const cardIdIndex = 0;

        //forcing carService function to return a determined value
        sandBox.stub(
            carService,
            carService.getRandomFromArray.name
        ).returns(cardIdIndex)

        const result = carService.chooseRandomCarId(carCategory);
        const expected = carCategory.carIds[cardIdIndex];

        expect(result).to.be.equal(expected);
        //return true if called once
        expect(carService.getRandomFromArray.calledOnce).to.be.ok;
    })

    it('given a car category should return an avaible car', async () => {

        const car = mocks.validCar;
        const carCategory = Object.create(mocks.validCarCategory);
        carCategory.carIds = [car.id];

        sandBox.stub(
            carService.carRepository,
            carService.carRepository.find.name,
        ).resolves(car);

        sandBox.spy(
            carService,
            carService.chooseRandomCarId.name
        )

        const result = await carService.getAvailableCar(carCategory);
        const expected = car;

        expect(result).to.be.deep.equal(expected);
        expect(carService.chooseRandomCarId.calledOnce).to.be.ok;
        expect(carService.carRepository.find.calledWithExactly(car.id)).to.be.ok;
    })

    it('given a carCategory, customer and numberOfDaysdays it should calculate final amount in brazilian currency', async () => {
        const customer = Object.create(mocks.validCustomer);
        customer.age = 50;

        const carCategory = Object.create(mocks.validCarCategory);
        carCategory.price = 37.6;
        const numberOfDays = 5;
        const expected = carService.currencyFormat(244.4);

        const result = await carService.calculateFinalPrice(customer, carCategory, numberOfDays);

        //to not depend of an external data (Tax class)
        sandBox.stub(
            carService,
            "taxesBasedOnAge"
        ).get(() => [{ from: 40, to: 100, then: 1.3 }])


        expect(result).to.be.deep.equal(expected);
    })

    it('given a custumer and carCategory it should return a transaction receipt on portuguese lang', async () => {
        const car = mocks.validCar;
        const carCategory = {
            ...mocks.validCarCategory, price: 37.6, carIds: [car.id]
        };

        const customer = { ...mocks.validCustomer, age: 20 };

        const numberOfDays = 5;
        const dueDate = "27 de março de 2023"

        const now = new Date(2023, 02, 22);
        sandBox.useFakeTimers(now.getTime());

        sandBox.stub(
            carService.carRepository,
            carService.carRepository.find.name,
        ).resolves(car);

        const options = {
            year: "numeric",
            month: "long",
            day: "numeric"
        }

        const expectedAmount = carService.currencyFormat(206.8)
        const result = await carService.rent(customer, carCategory, numberOfDays);
        const expected = new Transaction({ customer, car, amount: expectedAmount, dueDate });

        expect(result).to.be.deep.equal(expected);

    })


    it('given an no IT it should return the complete content', async () => {

        const repo = new BaseRepository({ file: join(__dirname, '../../database', 'cars.json') });
        const expected = await require(join(__dirname, '../../database', 'cars.json'));
        const result = await repo.find();

        expect(result).to.be.deep.equal(expected)
    })

    it('given an inexistent IT it should return an empty array', async () => {

        const repo = new BaseRepository({ file: join(__dirname, '../../database', 'cars.json') });
        const expected = [];
        const result = await repo.find(1);

        expect(result).to.be.deep.equal(expected)
    })

    it('given an existent IT it should return an object', async () => {

        const repo = new BaseRepository({ file: join(__dirname, '../../database', 'cars.json') });
        const expected = mocks.validCar;

        const result = await repo.find(mocks.validCar.id);

        expect(result).to.be.deep.equal(expected)
    })
});