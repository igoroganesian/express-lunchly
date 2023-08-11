"use strict";

/** Routes for Lunchly */

const express = require("express");

const { BadRequestError } = require("./expressError");
const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();


/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  let customers;
  console.log(req.query.search);  //TODO: Back to results

  if (req.query.search) {
    customers = await Customer.search(req.query.search);
    // console.log(customers);
    customers.map(customer => customer.fName = customer.fullName()); //TODO: Different variable.  Don't need it.
  } else {
    customers = await Customer.all();
    customers.map(customer => customer.fName = customer.fullName());
  }

  return res.render("customer_list.html", { customers });
});


/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.html");
});


/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});


/** Display the 10 customers with the most reservations. */

router.get("/top-ten/", async function (req, res, next) {

  console.log("Do we get here?");

  const customers = await Customer.topTen();
  console.log("Customers:", customers);

  customers.map(customer => customer.fName = customer.fullName()); //TODO: fix
  console.log("Customers after map:", customers);

  return res.render("customer_list.html", { customers });
});


/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  console.log("In: id = ", req.params.id);
  const customer = await Customer.get(req.params.id);
  const fullName = customer.fullName();

  const reservations = await customer.getReservations();

  return res.render("customer_detail.html", { customer, reservations, fullName });
});


/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  const fullName = customer.fullName();

  res.render("customer_edit_form.html", { customer, fullName });
});


/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});


/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});


module.exports = router;
