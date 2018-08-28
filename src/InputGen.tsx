
import * as React from "react";


export default class InputGenerator {
  private id: string;
  private label: string;
  private owner: React.Component;
  private type: string;

  constructor(owner: React.Component, type: string, id: string, init_val: any, label: string) {
    this.id    = id;
    this.label = label;
    this.owner = owner;
    this.type  = type;
    if (typeof this.owner.state !== "object") {
      throw new Error(`owner's state object must be initialized`);
    }
    if (this.owner.state[this.id] !== undefined) {
      throw new Error(`state property ${this.id} already exists`);
    }
    this.owner.state[this.id] = init_val;
    this.changeCallback = this.changeCallback.bind(this);
  }


  public changeCallback(event: any): void {
    let new_val: any = (event && event.target && event.target.value || "");
    if (this.type === "number") {
      new_val = parseFloat(new_val);
      if (!Number.isFinite(new_val)) {
        new_val = 0;
      }
    }
    if (this.owner.state[this.id] === new_val) {
      return;
    }
    const new_state_piece = {};
    new_state_piece[this.id] = new_val;
    this.owner.setState(new_state_piece);
  }


  public getControlBox(): JSX.Element {
    return (
      <span>
        {this.label}:
        <input
          type={this.type}
          defaultValue={String(this.owner.state[this.id])}
          onBlur={this.changeCallback}
        />
      </span>
    );
  }


  public getValue(): any {
    return this.owner.state[this.id];
  }

}
