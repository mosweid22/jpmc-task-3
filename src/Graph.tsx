import React, { Component } from "react";
import { Table, TableData } from "@finos/perspective";
import { ServerRespond } from "./DataStreamer";
import { DataManipulator } from "./DataManipulator";
import "./Graph.css";

interface IProps {
  data: ServerRespond[];
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement("perspective-viewer");
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName(
      "perspective-viewer"
    )[0] as unknown as PerspectiveViewerElement;

    const schema = {
      //fields for the prices of both stocks were added to calculate the ratio
      price_abc: "float",
      price_def: "float",
      //added a ratio field to track the ratio of two stocks
      ratio: "float",
      //timestamp was added to track everything according to the time
      timestamp: "date",
      // lower and upper bound fields were added to ultimately track where they intercept leading to a trigger alert
      upper_bound: "float",
      lower_bound: "float",
      trigger_alert: "float",
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);

      // the view of the graph is set to y_line to show us a linear graph
      elem.setAttribute("view", "y_line");

      // row pivots is for the x-axis, which is going to show timestamps
      elem.setAttribute("row-pivots", '["timestamp"]');

      // columns is used to display the following values
      elem.setAttribute(
        "columns",
        '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'
      );

      //aggregates determines duplicate points and sets them at one point
      elem.setAttribute(
        "aggregates",
        JSON.stringify({
          price_abc: "avg",
          price_def: "avg",
          ratio: "avg",
          timestamp: "distinct count",
          upper_bound: "avg",
          lower_bound: "avg",
          trigger_alert: "avg",
        })
      );
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
