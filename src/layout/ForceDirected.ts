
import Block from "../core/Block";
import Connector from "../core/Connector";
import Diagram from "../core/Diagram";
import Point from "../core/Point";
import Vector from "../core/Vector";


const REPULSION_CONSTANT: number = 10;
const ATTRACTION_CONSTANT: number = 10;


export default class ForceDirected {
  private finalized: boolean;
  private iterations: number;
  private nodes: Node[];
  private total_disp: number;

  constructor() {
    this.finalized = false;
    this.nodes = [];
  }


  public addBlock(block: Block): Node {
    this.throwIfFinalized();
    const node: Node = new Node(block);
    this.nodes.push(node);
    return node;
  }


  public addRelationship(from: Block, to: Block) {
    this.throwIfFinalized();
    const from_node: Node = this.getNodeFromBlock(from);
    const   to_node: Node = this.getNodeFromBlock(to);
    from_node.addEdge(  to_node);
      to_node.addEdge(from_node);
  }


  private allNodesCalcDisplacement(): number {
    let total_disp: number = 0;
    this.nodes.forEach((node: Node) => {
      total_disp += node.calcDisplacement();
      node.moveToNewPosition();
    });
    return total_disp;
  }


  private allNodesCalcForceAndVelocity(): void {
    this.nodes.forEach((node: Node) => {
      node.initializeForce();
      node.calcRepulsion(this.nodes);
      node.calcAttraction();
      node.updateVelocity();
      node.calcNewPosition();
    });
  }


  public begin(): void {
    this.throwIfFinalized();
    this.iterations = 10;
    this.total_disp = 0;
    this.reset();
  }

  private finalize(): void {
    this.throwIfFinalized();
    let iterations: number = 0;
    let total_disp: number;
    this.reset();
    do {
      this.allNodesCalcForceAndVelocity();
      total_disp += this.allNodesCalcDisplacement();
      iterations += 1;
    } while (iterations < 100 && total_disp > 100);
    this.finalized = true;
  }


  private getNodeFromBlock(block: Block): Node {
    let found_node: Node;
    this.nodes.forEach((node: Node) => {
      if (!found_node && node.getBlock() === block) {
        found_node = node;
      }
    });
    return found_node;
  }


  public iterate(): boolean {
    this.throwIfFinalized();
    if (this.iterations < 1) {
      console.log(`no more iterations needed`);
      return;
    }
    this.allNodesCalcForceAndVelocity();
    this.iterations -= 1;
    this.total_disp = this.allNodesCalcDisplacement();
    if (this.total_disp < 10) {
      this.iterations = 0;
    }
    return (this.iterations > 0); // more iterations required
  }


  public layoutDiagram(diagram: Diagram) {
    diagram.forEachBlock((block: Block) => {
      this.addBlock(block);
    });
    diagram.forEachBlock((block: Block) => {
      block.getConnectors().forEach((connector: Connector) => {
        this.addRelationship(
          block,
          connector.getTo());
      });
    });
    this.finalize();
    this.nodes.forEach((node: Node) => {
      node.setBlockPositionFromNode();
    });
  }


  public reset(): void {
    this.nodes.forEach((node: Node) => {
      node.reset();
    });
  }


  private throwIfFinalized() {
    if (this.finalized) {
      throw new Error("finalized");
    }
  }

}


class Node {
  private block: Block;
  private position: Point;
  private new_position: Point;
  private force: Vector;
  private velocity: Vector;
  private edges: Node[];

  constructor(block: Block) {
    this.block = block;
    this.edges = [];
  }


  public addEdge(other_node: Node) {
    this.edges.push(other_node);
  }


  public getVectorTo(other_node: Node): Vector {
    const v: Vector = Vector.fromOriginTo(other_node.position);
    v.subtract(Vector.fromOriginTo(this.position));
    return v;
  }


  public calcAttraction(): void {
    this.edges.forEach((other_node: Node) => {
      this.force.add(this.calcAttractionForce(other_node, 10));
    });
  }


  public calcAttractionForce(other_node: Node, spring_length: number): Vector {
    const between: Vector = this.getVectorTo(other_node);
    const proximity: number = Math.max(between.getMagnitude(), 1);
    between.setMagnitude(ATTRACTION_CONSTANT * Math.max(proximity - spring_length, 0));
    return between;
  }


  public calcDisplacement(): number {
    const v: Vector = Vector.fromOriginTo(this.new_position);
    v.subtract(Vector.fromOriginTo(this.position));
    return v.getMagnitude();
  }


  public calcNewPosition(): void {
    this.new_position = this.position.clone();
    this.new_position.add(this.velocity.toPoint());
  }


  public calcRepulsion(all_nodes: Node[]): void {
    all_nodes.forEach((other_node: Node) => {
      if (other_node !== this) {
        this.force.add(this.calcRepulsionForce(other_node));
      }
    });
  }


  public calcRepulsionForce(other_node: Node): Vector {
    const between: Vector = this.getVectorTo(other_node);
    const proximity: number = Math.max(between.getMagnitude(), 1);
    between.setMagnitude(-(REPULSION_CONSTANT / Math.pow(proximity, 2)));
    return between;
  }


  public getBlock(): Block {
    return this.block;
  }


  public initializeForce(): void {
    this.force = new Vector(0, 0);
  }


  public moveToNewPosition(): void {
    this.position = this.new_position;
  }


  public reset(): void {
    this.position = new Point(Math.random() * 100, Math.random() * 100);
    this.velocity = new Vector(0, 0);
  }


  public setBlockPositionFromNode(): void {
    this.block.getCentre().setTo(this.position);
  }


  public updateVelocity(): void {
    this.velocity.add(this.force);
  }

}
