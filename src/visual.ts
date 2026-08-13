"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import * as d3 from "d3";
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
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private svgRoot: d3.Selection<SVGElement, unknown, null, undefined>;
    private ellipse: d3.Selection<SVGElement, unknown, null, undefined>;
    private text: d3.Selection<SVGElement, unknown, null, undefined>;


    // D3 chart members
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    // Chart margins (kept as instance state so update() can reuse them)
    private readonly marginTop = 20;
    private readonly marginRight = 20;
    private readonly marginBottom = 30;
    private readonly marginLeft = 40;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
<<<<<<< HEAD
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;

        if (document) {
            // Create the SVG container once; it will be resized/redrawn in update()
            this.svg = d3.select(this.target)
                .append("svg")
                .attr("class", "chart-svg");

            // Empty axis groups created up front, populated on each update()
            this.xAxisGroup = this.svg.append("g")
                .attr("class", "x-axis");

            this.yAxisGroup = this.svg.append("g")
                .attr("class", "y-axis");
        }
=======

        this.svgRoot = d3.select(options.element).append("svg");
        this.ellipse = this.svgRoot.append("ellipse").style("fill", "lightblue").style("stroke", "black").style("stroke-width", 2).style("stroke-width", 4);
        this.text = this.svgRoot.append("text");

>>>>>>> 86cf0d4b545a70dbef5a620c800a5dda66ab5d11
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

<<<<<<< HEAD
        try {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);

            console.log('Visual update', options);

            // Use the visual's actual viewport instead of hardcoded 640x400
            const width = options.viewport.width;
            const height = options.viewport.height;

            this.svg
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`);

            // Declare the x (horizontal position) scale.
            const x = d3.scaleUtc()
                .domain([new Date("2023-01-01"), new Date("2024-01-01")])
                .range([this.marginLeft, width - this.marginRight]);

            // Declare the y (vertical position) scale.
            const y = d3.scaleLinear()
                .domain([0, 100])
                .range([height - this.marginBottom, this.marginTop]);

            // Update the x-axis.
            this.xAxisGroup
                .attr("transform", `translate(0,${height - this.marginBottom})`)
                .call(d3.axisBottom(x) as any);

            // Update the y-axis.
            this.yAxisGroup
                .attr("transform", `translate(${this.marginLeft},0)`)
                .call(d3.axisLeft(y) as any);

            this.events.renderingFinished(options);
        }
        catch (error) {
            console.log('Error in update method', error);
            this.events.renderingFailed(options, String(error))
        }
=======
>>>>>>> 86cf0d4b545a70dbef5a620c800a5dda66ab5d11
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}