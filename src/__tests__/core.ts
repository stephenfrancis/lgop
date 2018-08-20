
import Point from "../core/Point";
import Vector from "../core/Vector";


test("stuff", () => {
  const a: Point = new Point(10, 10);
  const b: Point = new Point(20, 10);
  const c: Point = a.clone();
  a.add(b);

  // b co-ords are added to a
  expect(a.getX()).toBe(30);
  expect(a.getY()).toBe(20);

  // b is unchanged
  expect(b.getX()).toBe(20);
  expect(b.getY()).toBe(10);

  b.subtract(c);
  expect(b.getX()).toBe(10);
  expect(b.getY()).toBe(0);

  // a = [30, 20], b = [10, 0], c = [10, 10]

  let v: Vector = Vector.fromOriginTo(a);
  expect(v.getBearing().toFixed(2)).toBe("123.69");
  expect(v.getMagnitude().toFixed(3)).toBe("36.056");

  v = Vector.fromOriginTo(b);
  expect(v.getBearing()).toBe(90);
  expect(v.getMagnitude()).toBe(10);

  v = Vector.between(a, b);
  expect(v.getBearing()).toBe(315);
  expect(v.getMagnitude().toFixed(3)).toBe("28.284");

  let d: Point = v.toPoint();
  expect(d.getX().toFixed(5)).toBe("-20.00000");
  expect(d.getY().toFixed(5)).toBe("-20.00000");

});
