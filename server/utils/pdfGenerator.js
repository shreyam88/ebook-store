const PDFDocument = require("pdfkit");

/**
 * Returns comprehensive chapter breakdown based on the book title/category.
 */
function getBookContent(book) {
  const title = (book.title || "").toLowerCase();

  if (title.includes("react")) {
    return [
      {
        title: "Introduction to React & Component Architecture",
        summary: "Understanding declarative UI, JSX compilation, Virtual DOM diffing, and functional components.",
        content: [
          "React is a declarative, efficient, and flexible JavaScript library for building user interfaces. Instead of directly manipulating the DOM with imperative operations, React allows developers to construct interactive UIs out of isolated pieces of code called components.",
          "## What is JSX?",
          "JSX is a syntax extension for JavaScript that resembles HTML. Browsers do not understand JSX directly; modern bundlers (like Vite and Babel) compile JSX into standard React.createElement calls.",
          "## The Virtual DOM",
          "React maintains a lightweight representation of the real DOM in memory, known as the Virtual DOM. When component state changes, React runs a Reconciliation algorithm (React Fiber), computes the difference (diffing), and batches the minimal set of DOM mutations needed to bring the browser screen in sync.",
          "## Component Lifecycle",
          "Functional components follow three primary phases: Mounting (initial render and layout effects), Updating (re-rendering triggered by state or prop changes), and Unmounting (cleanup of timers, subscriptions, and listeners)."
        ]
      },
      {
        title: "Mastering React Hooks",
        summary: "Deep dive into useState, useEffect, useContext, useRef, useMemo, and useCallback.",
        content: [
          "Hooks were introduced in React 16.8 to allow developers to use state and lifecycle features in functional components without writing class components.",
          "## useState",
          "The useState hook declares a state variable that persists between renders. State setters can take either a new value or an updater function (prev => next) to avoid stale closures.",
          "## useEffect",
          "The useEffect hook synchronizes a component with external systems (such as network requests, DOM APIs, and timers). Passing an empty dependency array runs the effect once after mount; returning a cleanup function prevents memory leaks when the component unmounts.",
          "## useCallback & useMemo",
          "useMemo caches the result of expensive calculations between renders. useCallback caches a function definition between renders to maintain referential equality when passing callbacks to memoized children."
        ]
      },
      {
        title: "State Management & Data Flow",
        summary: "Unidirectional data flow, Context API, lifting state up, and global state strategies.",
        content: [
          "React enforces unidirectional data flow: data always flows downward from parent to child through props. When multiple components need access to the same state, standard practice is to lift the state up to their closest common ancestor.",
          "## The Context API",
          "For state that needs to be accessed across deeply nested component trees (such as themes, authentication tokens, and user profiles), the Context API avoids prop drilling by providing a Provider and useContext consumer.",
          "## Controlled vs Uncontrolled Components",
          "In controlled components, form data is handled by a React component state. In uncontrolled components, form data is handled by the DOM itself using refs."
        ]
      },
      {
        title: "Performance Optimization & Production Patterns",
        summary: "React.memo, code splitting with React.lazy, Suspense, and memory management.",
        content: [
          "Building scalable applications requires understanding how and why components re-render. Excessive re-renders can degrade user experience, especially on lower-powered mobile devices.",
          "## Code Splitting & Lazy Loading",
          "Instead of shipping the entire JavaScript bundle on initial page load, React.lazy and Suspense allow dynamically importing components only when they are rendered on screen.",
          "## Production Best Practices",
          "1. Always specify unique, stable keys when rendering lists (avoid array indices when items can reorder).",
          "2. Avoid anonymous inline functions in hot render paths when passing to PureComponents.",
          "3. Keep component state as localized as possible to minimize re-render blast radiuses."
        ]
      }
    ];
  }

  if (title.includes("javascript")) {
    return [
      {
        title: "Modern JavaScript & ES6+ Fundamentals",
        summary: "Block scoping with let and const, arrow functions, destructuring, and template literals.",
        content: [
          "JavaScript is the cornerstone language of the modern web. With the introduction of ECMAScript 2015 (ES6) and subsequent annual releases, JavaScript evolved into a mature, powerful language supporting both functional and object-oriented paradigms.",
          "## Variable Declarations: var, let, and const",
          "Traditional 'var' declarations are function-scoped and hoisted with an initial value of undefined. In contrast, 'let' and 'const' are block-scoped and live in a Temporal Dead Zone (TDZ) until evaluated, preventing unpredictable hoisting bugs.",
          "## Arrow Functions & Lexical 'this'",
          "Arrow functions provide a concise syntax and, critically, do not bind their own 'this'. Instead, they capture the 'this' value of the enclosing lexical context, eliminating the common need for '.bind(this)' or 'var self = this'."
        ]
      },
      {
        title: "Execution Context, Call Stack & Closures",
        summary: "How the JavaScript engine executes code: memory creation phase, execution phase, and lexical closures.",
        content: [
          "Understanding JavaScript's internal mechanics is essential for writing bug-free code and mastering technical interviews.",
          "## The Execution Context",
          "Whenever JavaScript runs, it executes inside an Execution Context. Each context consists of a Variable Environment and a Lexical Environment. Execution proceeds in two phases: the Memory Creation phase (allocating space for variables and functions) and the Code Execution phase (running code line-by-line).",
          "## Closures in Practice",
          "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). Closures allow inner functions to access outer scope variables even after the outer function has completed execution, forming the foundation of data encapsulation and private variables."
        ]
      },
      {
        title: "Asynchronous JavaScript & The Event Loop",
        summary: "Single-threaded non-blocking I/O, Call Stack, Task Queue, Microtask Queue, Promises, and async/await.",
        content: [
          "JavaScript is single-threaded: it has one call stack and can only execute one command at a time. Yet, it performs asynchronous operations smoothly through the browser's Web APIs and the Event Loop.",
          "## The Event Loop Architecture",
          "When an asynchronous operation (like fetch, setTimeout, or event listener) completes, its callback is placed in either the Task Queue (Macrotask) or the Microtask Queue (Promises, queueMicrotask). The Event Loop constantly monitors the Call Stack; once the stack is empty, it drains the Microtask Queue before processing macrotasks.",
          "## Promises & async/await",
          "Promises represent the eventual completion or failure of an asynchronous operation, avoiding 'callback hell'. The async/await syntax provides a clean, synchronous-looking abstraction over native Promises."
        ]
      },
      {
        title: "Essential DOM APIs & Event Delegation",
        summary: "DOM manipulation, event bubbling, event capturing, and high-performance event delegation.",
        content: [
          "The Document Object Model (DOM) is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content.",
          "## Event Propagation: Bubbling & Capturing",
          "When an event occurs on a DOM element, it first travels down from the window to the target element (Capturing Phase), and then bubbles back up to the root (Bubbling Phase).",
          "## Event Delegation",
          "Instead of attaching separate event listeners to dozens or hundreds of individual child elements, Event Delegation attaches a single listener to a common parent element, leveraging event bubbling for superior memory efficiency."
        ]
      }
    ];
  }

  if (title.includes("time machine")) {
    return [
      {
        title: "The Fourth Dimension & The Invention",
        summary: "The Time Traveller demonstrates his mathematical model of time as a fourth dimension to his guests.",
        content: [
          "The Time Traveller was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lights caught the bubbles that flashed and passed in our glasses.",
          "'You must follow me carefully,' he said. 'I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception. There are really four dimensions, three which we call the three planes of Space, and a fourth, Time.'",
          "There is no difference between Time and any of the three dimensions of Space except that our consciousness moves along it. Upon that foundation, the Time Traveller unveiled a miniature model of ivory and crystalline framework—his working mechanism for traversing through the ages."
        ]
      },
      {
        title: "Journey to the Golden Age: The Eloi",
        summary: "The Time Traveller accelerates forward through centuries, arriving in the year 802,701 AD.",
        content: [
          "The night came like the turning out of a lamp, and in another moment came tomorrow. The laboratory grew faint and hazy, and then disappeared in a blinding rush of sunshine and storm. The clock hands spun like whirlwinds, and human dwellings rose and fell like waves of the sea.",
          "When he finally brought the machine to a halt on a rhododendron hillside, he found himself in the year eight hundred and two thousand seven hundred and one.",
          "He was greeted by graceful, delicate creatures of miniature stature, clad in purple tunics—the Eloi. In this apparent Eden, disease, warfare, and heavy labor had vanished. But under the gentle indolence of these fragile beings lay an eerie absence of curiosity, passion, and intellect."
        ]
      },
      {
        title: "The Mystery of the Under-World: The Morlocks",
        summary: "The disappearance of the Time Machine and the discovery of the predatory underworld race.",
        content: [
          "The pleasant reverie was shattered when the Time Traveller returned to the lawn: his Time Machine had vanished, dragged into the bronze pedestal of the Great White Sphinx.",
          "Investigating deep ventilation shafts that hummed with subterranean machinery, he discovered the dark counterpart to the gentle surface dwellers: the Morlocks. Pale, bleached, photophobic ape-like creatures that toiled in subterranean darkness, maintaining the machinery of the planet.",
          "The human species had not unified into harmony; it had split into two distinct evolutionary branches: the graceful, helpless Eloi above ground, and the predatory, industrious Morlocks who fed upon them in the shadows of the night."
        ]
      }
    ];
  }

  // Generic rich content for literature, notes, or uploaded books
  return [
    {
      title: "Author's Preface & Introduction",
      summary: "Historical background, themes, and intellectual context of the work.",
      content: [
        `This digital edition presents '${book.title}' by ${book.author}, carefully curated for readers, students, and professionals.`,
        "## Core Themes & Overview",
        book.description || "An essential collection of timeless knowledge and literature.",
        "## Structural Outline",
        "The chapters that follow explore the foundational principles, narrative arcs, and critical insights of this work. Read systematically or reference specific sections as your studies and curiosity demand."
      ]
    },
    {
      title: "Foundations & Key Concepts",
      summary: "Detailed exposition of primary ideas and chapter mechanics.",
      content: [
        "Every profound work is built upon rigorous foundational concepts that reward close examination.",
        "## Analysis & Study Notes",
        "1. Contextual Relevance: The ideas discussed herein remain deeply influential across modern thinking.",
        "2. Methodological Rigor: Understanding the progression of arguments provides practical insight into the author's worldview.",
        "3. Practical Applications: Connect the theoretical framework with real-world practice, coding methodologies, or analytical reasoning."
      ]
    },
    {
      title: "Critical Insights & Practical Takeaways",
      summary: "Summary reflections, key reference pointers, and concluding notes.",
      content: [
        "Synthesizing the core elements of the work highlights how these concepts integrate into a coherent, actionable whole.",
        "## Summary Takeaways",
        "- Mastery requires consistent review, application, and critical engagement with the core text.",
        "- Return to these chapters regularly to reinforce understanding and build lasting expertise.",
        "- Thank you for reading this official E-Book Store publication."
      ]
    }
  ];
}

/**
 * Renders a complete, beautifully designed PDF into a PDFKit Document.
 */
function generateEbookPdf(doc, book) {
  const primaryColor = "#4338ca"; // Indigo
  const textColor = "#1f2937";
  const lightGray = "#6b7280";
  const accentColor = "#059669"; // Emerald

  // --- PAGE 1: TITLE & COVER PAGE ---
  doc.rect(0, 0, doc.page.width, 18).fill(primaryColor);

  doc.moveDown(4);
  doc.fontSize(11).fillColor(primaryColor).text("E-BOOK STORE DIGITAL LIBRARY EDITION", {
    align: "center",
    characterSpacing: 2,
  });

  doc.moveDown(1.5);
  doc.fontSize(28).fillColor(textColor).text(book.title, {
    align: "center",
  });

  doc.moveDown(0.8);
  doc.fontSize(16).fillColor(lightGray).text(`By ${book.author}`, {
    align: "center",
  });

  doc.moveDown(1.5);
  doc.fontSize(11).fillColor(accentColor).text(
    `Category: ${book.category || "General"}   |   Price: Rs. ${book.price ?? 0}`,
    { align: "center" }
  );

  doc.moveDown(3);
  doc.strokeColor("#e5e7eb").lineWidth(1)
    .moveTo(80, doc.y)
    .lineTo(doc.page.width - 80, doc.y)
    .stroke();

  doc.moveDown(3);
  doc.fontSize(10).fillColor(lightGray).text(
    "Published by E-Book Store\nLicensed for personal reading and learning.\nVerified Digital Edition.",
    {
      align: "center",
      lineGap: 4,
    }
  );

  // --- PAGE 2: SYNOPSIS & TABLE OF CONTENTS ---
  doc.addPage();
  doc.fontSize(18).fillColor(primaryColor).text("Book Synopsis", 50, 50);
  doc.moveDown(0.8);
  doc.fontSize(11).fillColor(textColor).text(
    book.description || "Comprehensive guide and literary edition.",
    {
      lineGap: 5,
      align: "justify",
    }
  );

  doc.moveDown(2);
  doc.fontSize(18).fillColor(primaryColor).text("Table of Contents");
  doc.moveDown(0.8);

  const chapters = getBookContent(book);

  chapters.forEach((ch, idx) => {
    doc.fontSize(12).fillColor(textColor).text(`Chapter ${idx + 1}:  ${ch.title}`, {
      lineGap: 3,
    });
    doc.fontSize(9.5).fillColor(lightGray).text(`     ${ch.summary}`, {
      lineGap: 6,
    });
  });

  // --- CHAPTER PAGES ---
  chapters.forEach((ch, idx) => {
    doc.addPage();
    doc.fontSize(9).fillColor(lightGray).text(`${book.title}   |   Chapter ${idx + 1}`, {
      align: "right",
    });

    doc.moveDown(1);
    doc.fontSize(20).fillColor(primaryColor).text(`Chapter ${idx + 1}: ${ch.title}`);
    doc.moveDown(1.2);

    ch.content.forEach((para) => {
      if (para.startsWith("## ")) {
        doc.moveDown(0.6);
        doc.fontSize(13).fillColor(primaryColor).text(para.replace("## ", ""), {
          lineGap: 4,
        });
        doc.moveDown(0.3);
      } else {
        doc.fontSize(10.5).fillColor(textColor).text(para, {
          lineGap: 4.5,
          align: "justify",
        });
        doc.moveDown(0.8);
      }
    });
  });
}

module.exports = {
  generateEbookPdf,
};
