const Queue = require("bull");

const printStuff = new Queue("alpha", "redis://127.0.0.1:6379");
const calculateTak = new Queue("beta", "redis://127.0.0.1:6379");

function tak(x: number, y: number, z: number): number {
  if (y > x) {
    return z;
  }
  return tak(tak(x - 1, y, z), tak(y - 1, z, x), tak(z - 1, x, y));
}

printStuff.process(function (job) {
  console.log("HELLO WORLD");
  return Promise.resolve({ framerate: 29.5 /* etc... */ });
});

function f() {
  setTimeout(() => {
    console.log("hello world");
    f();
  }, 4000);
}

printStuff.add({ hello: "world" });
