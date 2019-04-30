
import Block from "../core/Block";
import Diagram from "../core/Diagram";
import Direction from "../core/Direction";
import FileOutput from "../drawing/FileOutput";
import Lee from "../layout/Lee";
import Scale from "../layout/Scale";


test("main", () => {
  const d: Diagram = new Diagram();
  d.setTitle("Lee Test");
  const b1: Block = new Block("top_left"    , 20, 5, 15, 10);
  d.addBlock(b1);
  const b2: Block = new Block("middle"      , 20, 5, 25, 20);
  d.addBlock(b2);
  const b3: Block = new Block("bottom_right", 20, 5, 35, 30);
  d.addBlock(b3);
  b1.addConnector(b3, Direction.get("E"), Direction.get("W"));

  expect(d.output()).toEqual("\
  Lee Test\n\
  ===============\n\
[60, 47.5]\n\
\n\
<top_left> at [15, 10]\n\
  E to <bottom_right> at [35, 30] W\n\
<middle> at [25, 20]\n\
<bottom_right> at [35, 30]\
");

  const d1: Diagram = d.copy();
  const s1: Scale = new Scale();
  s1.beginDiagram(d1);
  while (s1.iterate());
  (new FileOutput(d1)).write("./dist/lee_test_1.html");

  const l: Lee = new Lee();
  // console.log(l.output());
  l.beginDiagram(d);
  while (l.iterate());

  // console.log(d.output());

  expect(d.output()).toEqual("\
  Lee Test\n\
  ===============\n\
[60, 47.5]\n\
\n\
<top_left> at [15, 10]\n\
  E to <bottom_right> at [35, 30] W, [16, 10] - [16, 30], [16, 30] - [34, 30]\n\
<middle> at [25, 20]\n\
<bottom_right> at [35, 30]\
");

  const d2: Diagram = d.copy();
  const s2: Scale = new Scale();
  s2.beginDiagram(d2);
  while (s2.iterate());
  (new FileOutput(d2)).write("./dist/lee_test_2.html");

  d.reset();

  b1.removeConnector(0);

  b1.addConnector(b3, Direction.get("S"), Direction.get("N"));

  l.beginDiagram(d);
  while (l.iterate());

  expect(d.output()).toEqual("\
  Lee Test\n\
  ===============\n\
[60, 47.5]\n\
\n\
<top_left> at [15, 10]\n\
  S to <bottom_right> at [35, 30] N, [15, 11] - [35, 11], [35, 11] - [35, 29]\n\
<middle> at [25, 20]\n\
<bottom_right> at [35, 30]\
");

  const d3: Diagram = d.copy();
  const s3: Scale = new Scale();
  s3.beginDiagram(d3);
  while (s3.iterate());
  (new FileOutput(d3)).write("./dist/lee_test_3.html");

});
