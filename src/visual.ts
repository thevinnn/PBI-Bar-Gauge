"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from "./settings";
import * as d3 from "d3";

export class Visual implements IVisual {
    private events: IVisualEventService;
    private target: HTMLElement;
    private updateCount: number;
    private textNode: Text;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private svgRoot: d3.Selection<SVGElement, unknown, null, undefined>;
    private ellipse: d3.Selection<SVGElement, unknown, null, undefined>;
    private text: d3.Selection<SVGElement, unknown, null, undefined>;


    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);

        this.svgRoot = d3.select(options.element).append("svg");
        this.ellipse = this.svgRoot.append("ellipse").style("fill", "lightblue").style("stroke", "black").style("stroke-width", 2).style("stroke-width", 4);
        this.text = this.svgRoot.append("text");

    }

    public update(options: VisualUpdateOptions) {
        this.svgRoot.attr("width", options.viewport.width)
            .attr("height", options.viewport.height);

        this.ellipse.attr("cx", options.viewport.width / 2)
            .attr("cy", options.viewport.height / 2)
            .attr("rx", options.viewport.width / 2.5)
            .attr("ry", options.viewport.height / 2.5);

        this.text.attr("x", options.viewport.width / 2)
            .attr("y", options.viewport.height / 2)
            .text(`Update count: TEST`);
        this.events.renderingStarted(options);

    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}