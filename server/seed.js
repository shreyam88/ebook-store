const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignored in restricted environments
}

require("dotenv").config({ path: path.join(__dirname, ".env") });

const Book = require("./models/Book");
const User = require("./models/User");

const booksData = [
  {
    title: "React Handwritten Notes",
    author: "Shreyam",
    description:
      "Comprehensive handwritten notes covering core React concepts, hooks, state management, components, lifecycle methods, and modern web application development best practices.",
    category: "Notes",
    price: 99,
    coverImage: "1790233738387-kimberly-farmer-lUaaKCUANVI-unsplash.jpg",
    pdfFile: "1790233673719-React-Handwritten-notes.pdf",
  },
  {
    title: "JavaScript Basics",
    author: "Code Academy",
    description:
      "A complete beginner-to-advanced guide to JavaScript, covering modern ES6+ syntax, asynchronous programming, DOM manipulation, closures, and essential interview questions.",
    category: "Programming",
    price: 129,
    coverImage: "1790234397364-jackson-sophat-wUbNvDTsOIc-unsplash.jpg",
    pdfFile: "1790252083348-javascript-basics.pdf.pdf",
  },
  {
    title: "The Time Machine",
    author: "H.G. Wells",
    description:
      "The Time Machine is a post-apocalyptic science fiction novella by H. G. Wells, published in 1895. The work popularized the concept of time travel using a vehicle to travel purposely forward or backward through time.",
    category: "Other",
    price: 199,
    coverImage: "1790233601239-the-time-machine-h-g-wells-10263.webp",
    pdfFile: "1790233601207-the-time-machine-h-g-wells-10263.pdf",
  },
  {
    title: "Death in Venice",
    author: "Thomas Mann",
    description:
      "Death in Venice is a famous novella written by the German author Thomas Mann, first published in 1912. It tells the story of Gustav von Aschenbach, a renowned writer visiting Venice.",
    category: "Other",
    price: 149,
    coverImage: "1790233399435-death-in-venice-thomas-mann-10259.webp",
    pdfFile: "1790233399431-death-in-venice-thomas-mann-10259-(1).pdf",
  },
  {
    title: "Heart of Darkness",
    author: "Joseph Conrad",
    description:
      "Heart of Darkness is an 1899 novella by Polish-English novelist Joseph Conrad about a voyage up the Congo River into the Congo Free State in the Heart of Africa.",
    category: "Other",
    price: 179,
    coverImage: "1790233897670-heart-of-darkness-joseph-conrad-169.webp",
    pdfFile: "1790233897662-5.-Heart-of-Darkness-Joseph-Conrad.pdf",
  },
  {
    title: "The Metamorphosis",
    author: "Franz Kafka",
    description:
      "The Metamorphosis is a novella by Franz Kafka published in 1915. It tells the story of salesman Gregor Samsa, who wakes one morning transformed into a monstrous insect.",
    category: "Other",
    price: 159,
    coverImage: "1790232905785-the-metamorphosis-franz-kafka-10258.webp",
    pdfFile: "1790232905773-death-in-venice-thomas-mann-10259.pdf",
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not set");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully!");

    // Check existing books
    const existingBooksCount = await Book.countDocuments();
    console.log(`Found ${existingBooksCount} existing books in database.`);

    if (existingBooksCount === 0) {
      console.log("Inserting sample books from uploads...");
      const inserted = await Book.insertMany(booksData);
      console.log(`✅ Successfully seeded ${inserted.length} books!`);
    } else {
      console.log("Books already exist in database. Skipping book seed.");
    }

    // Check existing admin user
    const existingAdmin = await User.findOne({ role: "admin" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@ebookstore.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("✅ Created default admin user: admin@ebookstore.com / admin123");
    } else {
      console.log(`Admin user already exists: ${existingAdmin.email}`);
    }

    console.log("\nDatabase seeding completed successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
