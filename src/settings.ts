/*
 *  Power BI Visualizations
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

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import powerbi from "powerbi-visuals-api";


/**
 * Bar Gauge visual settings
 */

class BarSettings extends FormattingSettingsCard {
    public BarColour = new formattingSettings.ColorPicker({
        name: "BarColour",
        displayName: "Bar Colour",
        value: { value: "#01B8AA" },
        visible: true
    });

    name: string = "bar";
    displayName: string = "Bar Settings";
    visible: boolean = true;
    slices: Array<FormattingSettingsSlice> = [this.BarColour];
}

class TargetLineSettings extends FormattingSettingsCard {
    public TargetLineColour = new formattingSettings.ColorPicker({
        name: "TargetLineColour",
        displayName: "Target Line Colour",
        value: { value: "#FF0000" },
        visible: true
    });

    TargetLineVisible = new formattingSettings.ToggleSwitch({
        name: "TargetLineVisible",
        displayName: "Show Target Line",
        value: true,
        visible: true
    });

    TargetLineWidth = new formattingSettings.NumUpDown({
        name: "TargetLineWidth",
        displayName: "Target Line Width",
        value: 2,
        options: {
            minValue: {
                type: powerbi.visuals.ValidatorType.Min,
                value: 1
            },
            maxValue: {
                type: powerbi.visuals.ValidatorType.Max,
                value: 10
            }
        },
        visible: true
    });

    TargetLineStyle = new formattingSettings.AutoDropdown({
        name: "TargetLineStyle",
        displayName: "Target Line Style",
        value: "solid",
        visible: true
    });

    name: string = "targetLine";
    displayName: string = "Target Line Settings";
    visible: boolean = true;
    slices: Array<FormattingSettingsSlice> = [this.TargetLineColour, this.TargetLineVisible, this.TargetLineWidth, this.TargetLineStyle];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    barSettings = new BarSettings();
    targetLineSettings = new TargetLineSettings();

    cards = [this.barSettings, this.targetLineSettings];


}
