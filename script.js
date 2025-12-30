alert("script.js loaded");
let driveChoice = ""; // stores Drive Yourself or Chauffeur

window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");

  if (window.scrollY > 40) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");
});

// DISABLE PAST DATES
const pickDate = document.getElementById("pickDate");
const dropDate = document.getElementById("dropDate");

const today = new Date().toISOString().split("T")[0];

pickDate.setAttribute("min", today);
dropDate.setAttribute("min", today);

// when pick date changes, drop date cannot be earlier
pickDate.addEventListener("change", () => {
  dropDate.value = "";
  dropDate.setAttribute("min", pickDate.value);
});

// Select ALL buttons inside the "driverbutton" div
const driverButtons = document.querySelectorAll(".driverbutton button");

// Select the booking section
const bookSection = document.querySelector(".booksection");

// Add click event to each hero button
driverButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Save the button text (Drive Yourself or Chauffeur)
    driveChoice = button.textContent.trim();

    alert("Please fill your details below");

    // Scroll to booking section
    bookSection.scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Rent A Car Now button
const rentButton = document.querySelector(".rent-btn");

rentButton.addEventListener("click", () => {
  // Collect form values
  const car = document.getElementById("carName").value;
  const pickup = document.getElementById("pickupLocation").value;
  const drop = document.getElementById("dropLocation").value;
  const pickDate = document.getElementById("pickDate").value;
  const dropDate = document.getElementById("dropDate").value;
  const pickTime = document.getElementById("pickupTime").value;
  const dropTime = document.getElementById("dropTime").value;

  // Check for missing fields
  if (!driveChoice) {
    alert("Please select Drive Yourself or Chauffeur first.");
    return;
  }

  if (
    !car ||
    !pickup ||
    !drop ||
    !pickDate ||
    !dropDate ||
    !pickTime ||
    !dropTime
  ) {
    alert("Please select/fill all required details.");
    return;
  }

  // All details filled — prepare WhatsApp message
  const message =
    `🚗 HALCHIQ CAR RENTAL BOOKING\n\n` +
    `Service Type: ${driveChoice}\n` +
    `Car: ${car}\n` +
    `Car: ${selectedFleetCar || car}\n` +
    `Amount: ${selectedFleetAmount || "N/A"}\n` +
    `Pick-up Location: ${pickup}\n` +
    `Drop-off Location: ${drop}\n` +
    `Pick-up Date: ${pickDate}\n` +
    `Drop-off Date: ${dropDate}\n` +
    `Pick-up Time: ${pickTime}\n` +
    `Drop-off Time: ${dropTime}`;

  // Replace with your WhatsApp number (format: 2547XXXXXXXX)
  const phoneNumber = "254721394672";
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // Open WhatsApp
  window.open(whatsappURL, "_blank");

  // Success alert
  alert("Booking submitted successfully!");

  // CLEAR THE FORM
  document.getElementById("carName").value = "";
  document.getElementById("pickupLocation").value = "";
  document.getElementById("dropLocation").value = "";
  document.getElementById("pickDate").value = "";
  document.getElementById("dropDate").value = "";
  document.getElementById("pickupTime").value = "";
  document.getElementById("dropTime").value = "";

  // Clear the stored choice
  driveChoice = "";
});

// Reserve Your Perfect Car button
const reserveBtn = document.querySelector(".reservecar button");

// Our Fleet section
const fleetSection = document.querySelector(".vehicle");

reserveBtn.addEventListener("click", function () {
  alert("View our fleet option below");

  fleetSection.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// Select all Book Now buttons in fleet
const fleetBookBtns = document.querySelectorAll(".vehicle3 button[data-car]");

// Reference to booking form car select
const carSelect = document.getElementById("carName");

// Variables to store selected fleet details
let selectedFleetCar = "";
let selectedFleetAmount = "";

fleetBookBtns.forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault(); // prevent default

    // Get car name from data attribute
    selectedFleetCar = button.dataset.car;

    // Get amount from sibling h3 label
    selectedFleetAmount = button
      .closest(".vehicle3")
      .querySelector("h3 label")
      .textContent.trim();

    // Auto-fill booking dropdown
    carSelect.value = selectedFleetCar;

    // Scroll to booking form
    document.querySelector(".rentcar").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Optional alert
    alert(
      `You selected ${selectedFleetCar} (${selectedFleetAmount}). Fill your booking details below.`
    );
  });
});

// Select all Inquiry buttons in fleet
const inquiryBtns = document.querySelectorAll(".vehicle3 .b2");

// Reference to booking form section
const bookingForm = document.querySelector(".rentcar");

inquiryBtns.forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault(); // prevent form submission if inside form

    // Optional alert
    alert("Please fill your details below for inquiry");

    // Scroll to booking form
    bookingForm.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
});

import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadFleetBtn");

  uploadBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("fleetFileInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Please select a file first");
      return;
    }

    // Normalize folder & file name for RLS compliance
    let docType = document.getElementById("docType").value.trim().toLowerCase();
    let cleanFileName = file.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")          // spaces → underscores
      .replace(/[^\w.-]/g, "");      // remove special chars except letters, numbers, dot, hyphen, underscore

    const filePath = `fleet/${docType}/${Date.now()}_${cleanFileName}`;

    console.log("=== DEBUG UPLOAD ===");
    console.log("Bucket: documents");
    console.log("File path:", filePath);
    console.log("File extension:", cleanFileName.split('.').pop());
    console.log("Document type:", docType);
    console.log("Supabase anon key in use? Check supabase.js");

    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: false });

      if (error) throw error;

      console.log("Upload success:", data);
      alert("Upload successful!");
      fileInput.value = "";
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed: " + err.message);
    }
  });
});
