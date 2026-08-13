/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
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

export class Visual implements IVisual {
    private events: IVisualEventService;
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

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
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);

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
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}