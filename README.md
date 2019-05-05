
# Automated Diagramming - Principles

The idea is that the source data represents things and their relationships in abstract,
and the program turns the data into a visual representation - a diagram.

At the top level there are two approaches:
- Lay out the things (i.e. blocks) first, then lay out their relationships (i.e. connectors).
- Lay out both at the same time

Of course, even if laying out the blocks first, their layout is driven by their connectors.
The connectors should influence the block layout both through which blocks are connected, and
which "directional indicators" are assigned to each end of the connection.

The current algorithm choices are:
* Block layout: Bellman-Ford
* Connector layout: Lee (or SimpleConnectors)
* Both together: force-directed

As the algorithms are applied, blocks gain centre-point co-ordinates and connectors gain
line segments. Under the Bellman-Ford-Lee approach, co-ordinates are scaled twice: Bellman-Ford
arranges blocks in an integer grid (OverlapFixer is intended to remove overlaps), which is then
scaled by a factor of 2 to produce a new integer grid in which there are guaranteed spaces
between blocks for the connectors to run. Finally, the integer grid is scaled up to a pixel grid.

Hence we have:
* Bellman-Ford-Lee (BFL) x2 scaling then pixel scaling
* Bellman-Ford-Simple-Connectors (BFSC) pixel scaling
* Force-Directed (FD) no scaling

There is no current control logic to indicate which scaling level a diagram is currently at,
or when blocks can be added or have their co-ordinates altered.

Also, there is no logic yet to determine a block's ideal width.

The logic and API for specifying the anchor point at which a connector joins a block needs
improvement.

Finally, there needs to be an algorithm to detect and adjust "connector parallel overlap".

Perhaps the control logic should just give a diagram three states: Edit, LayingOut and LaidOut.
Combined processes for BFL, BFSC and FD should each require that an argument diagram object
should begin in Edit, should set it to LayingOut at the beginning and LaidOut at the end.

