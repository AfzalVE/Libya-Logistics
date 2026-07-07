import { faker } from "@faker-js/faker";

import Customer from "../models/Customer.js";

export async function seedCustomers() {
  await Customer.deleteMany({});

  const customers = [];

  for (let i = 0; i < 100; i++) {
    customers.push({
      name: faker.person.fullName(),

      mobile:
        "2189" +
        faker.string.numeric(7),

      address:
        faker.location.streetAddress(),

      nationalId:
        faker.string.numeric(12),
    });
  }

  return Customer.insertMany(
    customers
  );
}