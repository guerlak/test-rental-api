const faker = require("faker");
const { join } = require("path")

const Car = require("../src/entities/Car");
const Customer = require("../src/entities/Customer");
const CarCategory = require("../src/entities/CarCategory");
const { writeFile } = require("fs/promises");

const seedFolder = join(__dirname, "../", "database");

const ITEMS_AMOUNT = 2;

const carCategory = new CarCategory({
    id: faker.random.uuid(),
    name: faker.vehicle.type(),
    carIds: [],
    price: faker.finance.amount(20, 100)
})

const customer = new Customer({
    id: faker.random.uuid(),
    name: faker.name.findName(),
    age: faker.random.number({ min: 18, max: 60 })
})

const cars = [];

for (let index = 0; index < ITEMS_AMOUNT; index++) {
    const car = new Car({
        id: faker.random.uuid(),
        name: faker.vehicle.model(),
        available: true,
        gasAvailable: true,
        releaseYear: faker.date.past().getFullYear()
    })

    carCategory.carIds.push(car.id);
    cars.push(car);
}

const write = (filename, data) => writeFile(join(seedFolder, filename), JSON.stringify(data));

(async () => {
    await write("cars.json", cars);
    await write("carCategories.json", [carCategory]);
    await write("customer.json", [customer]);

    console.log("cars", cars)
    console.log("categories", [carCategory]);
    console.log("cst", [customer]);
})();




