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
    private barsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private barGradient: d3.Selection<SVGLinearGradientElement, unknown, null, undefined>;

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

            this.barsGroup = this.svg.append("g")
                .attr("class", "bars");

            const defs = this.svg.append("defs");
            this.barGradient = defs.append("linearGradient")
                .attr("id", "bar-gradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");
            this.barGradient.append("stop")
                .attr("class", "gradient-start")
                .attr("offset", "0%");
            this.barGradient.append("stop")
                .attr("class", "gradient-end")
                .attr("offset", "100%");
        }
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        const data = [
            { month: "Jan", value: 42 },
            { month: "Feb", value: 71 },
            { month: "Mar", value: 55 },
        ];



        try {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews[0]);

            console.log('Visual update', options);

            // Use the visual's actual viewport instead of hardcoded 640x400
            const width = options.viewport.width;
            const height = options.viewport.height;

            const y = d3.scaleBand()
                .domain(data.map(d => d.month))   // ["Jan", "Feb", "Mar"]
                .range([this.marginTop, height - this.marginBottom])  
                .padding(0.1);                  // gap between bars


            const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)])   // 0 to the largest value
                .range([this.marginLeft, width - this.marginRight]);                     // gap between bars


            const animationEnabled = this.formattingSettings.dataPointCard.enableAnimation.value;
            const animationDuration = this.formattingSettings.dataPointCard.animationDuration.value;

            this.formattingSettings.dataPointCard.updateColorSliceVisibility();
            const isGradient = this.formattingSettings.dataPointCard.colorMode.value.value === "gradient";
            const singleColor = this.formattingSettings.dataPointCard.fill.value.value || "steelblue";
            const barFill = isGradient ? "url(#bar-gradient)" : singleColor;

            this.barGradient.select(".gradient-start")
                .attr("stop-color", this.formattingSettings.dataPointCard.gradientStartColor.value.value);
            this.barGradient.select(".gradient-end")
                .attr("stop-color", this.formattingSettings.dataPointCard.gradientEndColor.value.value);

            this.barsGroup.selectAll<SVGRectElement, typeof data[0]>("rect")
                .data(data, d => d.month)
                .join(
                    enter => {
                        const rect = enter.append("rect")
                            .attr("x", x(0))
                            .attr("y", d => y(d.month))
                            .attr("width", 0)
                            .attr("height", y.bandwidth())
                            .attr("fill", barFill);
                        return animationEnabled
                            ? rect.transition().duration(animationDuration)
                                .attr("width", d => x(d.value) - x(0))
                            : rect.attr("width", d => x(d.value) - x(0));
                    },
                    update => {
                        update.attr("fill", barFill);
                        return animationEnabled
                            ? update.transition().duration(animationDuration)
                                .attr("x", x(0))
                                .attr("y", d => y(d.month))
                                .attr("width", d => x(d.value) - x(0))
                                .attr("height", y.bandwidth())
                            : update
                                .attr("x", x(0))
                                .attr("y", d => y(d.month))
                                .attr("width", d => x(d.value) - x(0))
                                .attr("height", y.bandwidth());
                    },
                    exit => animationEnabled
                        ? exit.transition().duration(animationDuration)
                            .attr("width", 0)
                            .remove()
                        : exit.remove()
                );

                console.log('Bars drawn', this.barsGroup.selectAll("rect").attr("x"), this.barsGroup.selectAll("rect").attr("y"));

            this.svg
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`);

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