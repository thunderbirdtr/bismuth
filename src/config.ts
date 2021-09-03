// Copyright (c) 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// Copyright (c) 2021 Mikhail Zolotukhin <mail@genda.life>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import MonocleLayout from "./layouts/monocle_layout";
import TileLayout from "./layouts/tile_layout";
import ThreeColumnLayout from "./layouts/three_column_layout";
import StairLayout from "./layouts/stair_layout";
import SpiralLayout from "./layouts/spiral_layout";
import SpreadLayout from "./layouts/spread_layout";
import FloatingLayout from "./layouts/floating_layout";
import QuarterLayout from "./layouts/quarter_layout";
import CascadeLayout from "./layouts/cascade_layout";

import { ILayout } from "./ilayout";
import { ILayoutClass } from "./ilayout";

export default interface IConfig {
  //#region Layout
  layoutOrder: string[];
  layoutFactories: { [key: string]: () => ILayout };
  monocleMaximize: boolean;
  maximizeSoleTile: boolean;
  monocleMinimizeRest: boolean; // KWin-specific
  //#endregion

  //#region Features
  adjustLayout: boolean;
  adjustLayoutLive: boolean;
  keepFloatAbove: boolean;
  noTileBorder: boolean;
  limitTileWidthRatio: number;
  //#endregion

  //#region Gap
  screenGapBottom: number;
  screenGapLeft: number;
  screenGapRight: number;
  screenGapTop: number;
  tileLayoutGap: number;
  //#endregion

  //#region Behavior
  directionalKeyMode: "dwm" | "focus";
  newWindowAsMaster: boolean;
  //#endregion

  //#region KWin-specific
  layoutPerActivity: boolean;
  layoutPerDesktop: boolean;
  preventMinimize: boolean;
  preventProtrusion: boolean;
  pollMouseXdotool: boolean;
  //#endregion

  //#region KWin-specific Rules
  floatUtility: boolean;

  floatingClass: string[];
  floatingTitle: string[];
  ignoreClass: string[];
  ignoreTitle: string[];
  ignoreRole: string[];

  ignoreActivity: string[];
  ignoreScreen: number[];
  //#endregion

  debugEnabled: boolean;
}

export class Config implements IConfig {
  //#region Layout
  public layoutOrder: string[];
  public layoutFactories: { [key: string]: () => ILayout };
  public maximizeSoleTile: boolean;
  public monocleMaximize: boolean;
  public monocleMinimizeRest: boolean; // KWin-specific
  //#endregion

  //#region Features
  public adjustLayout: boolean;
  public adjustLayoutLive: boolean;
  public keepFloatAbove: boolean;
  public noTileBorder: boolean;
  public limitTileWidthRatio: number;
  //#endregion

  //#region Gap
  public screenGapBottom: number;
  public screenGapLeft: number;
  public screenGapRight: number;
  public screenGapTop: number;
  public tileLayoutGap: number;
  //#endregion

  //#region Behavior
  public directionalKeyMode: "dwm" | "focus";
  public newWindowAsMaster: boolean;
  //#endregion

  //#region KWin-specific
  public layoutPerActivity: boolean;
  public layoutPerDesktop: boolean;
  public preventMinimize: boolean;
  public preventProtrusion: boolean;
  public pollMouseXdotool: boolean;
  //#endregion

  //#region KWin-specific Rules
  public floatUtility: boolean;

  public floatingClass: string[];
  public floatingTitle: string[];
  public ignoreClass: string[];
  public ignoreTitle: string[];
  public ignoreRole: string[];

  public ignoreActivity: string[];
  public ignoreScreen: number[];
  //#endregion

  public debugEnabled: boolean;

  private kwinApi: KWin.Api;

  constructor(kwinApi: KWin.Api) {
    function commaSeparate(str: string): string[] {
      if (!str || typeof str !== "string") return [];
      return str.split(",").map((part) => part.trim());
    }

    this.kwinApi = kwinApi;

    this.debugEnabled = this.kwinApi.KWin.readConfig("debug", false);

    this.layoutOrder = [];
    this.layoutFactories = {};
    (
      [
        ["enableTileLayout", true, TileLayout],
        ["enableMonocleLayout", true, MonocleLayout],
        ["enableThreeColumnLayout", true, ThreeColumnLayout],
        ["enableSpreadLayout", true, SpreadLayout],
        ["enableStairLayout", true, StairLayout],
        ["enableSpiralLayout", true, SpiralLayout],
        ["enableQuarterLayout", false, QuarterLayout],
        ["enableFloatingLayout", false, FloatingLayout],
        ["enableCascadeLayout", false, CascadeLayout], // TODO: add config
      ] as Array<[string, boolean, ILayoutClass]>
    ).forEach(([configKey, defaultValue, layoutClass]) => {
      if (this.kwinApi.KWin.readConfig(configKey, defaultValue))
        this.layoutOrder.push(layoutClass.id);
      // TODO: Refactor this: config should not create factories. It is not its responsibility
      this.layoutFactories[layoutClass.id] = () => new layoutClass(this);
    });

    this.maximizeSoleTile = this.kwinApi.KWin.readConfig("maximizeSoleTile", false);
    this.monocleMaximize = this.kwinApi.KWin.readConfig("monocleMaximize", true);
    this.monocleMinimizeRest = this.kwinApi.KWin.readConfig("monocleMinimizeRest", false);

    this.adjustLayout = this.kwinApi.KWin.readConfig("adjustLayout", true);
    this.adjustLayoutLive = this.kwinApi.KWin.readConfig("adjustLayoutLive", true);
    this.keepFloatAbove = this.kwinApi.KWin.readConfig("keepFloatAbove", true);
    this.noTileBorder = this.kwinApi.KWin.readConfig("noTileBorder", false);

    this.limitTileWidthRatio = 0;
    if (this.kwinApi.KWin.readConfig("limitTileWidth", false))
      this.limitTileWidthRatio = this.kwinApi.KWin.readConfig("limitTileWidthRatio", 1.6);

    this.screenGapBottom = this.kwinApi.KWin.readConfig("screenGapBottom", 0);
    this.screenGapLeft = this.kwinApi.KWin.readConfig("screenGapLeft", 0);
    this.screenGapRight = this.kwinApi.KWin.readConfig("screenGapRight", 0);
    this.screenGapTop = this.kwinApi.KWin.readConfig("screenGapTop", 0);
    this.tileLayoutGap = this.kwinApi.KWin.readConfig("tileLayoutGap", 0);

    const directionalKeyDwm = this.kwinApi.KWin.readConfig("directionalKeyDwm", true);
    const directionalKeyFocus = this.kwinApi.KWin.readConfig("directionalKeyFocus", false);
    this.directionalKeyMode = directionalKeyDwm ? "dwm" : "focus";
    this.newWindowAsMaster = this.kwinApi.KWin.readConfig("newWindowAsMaster", false);

    this.layoutPerActivity = this.kwinApi.KWin.readConfig("layoutPerActivity", true);
    this.layoutPerDesktop = this.kwinApi.KWin.readConfig("layoutPerDesktop", true);
    this.floatUtility = this.kwinApi.KWin.readConfig("floatUtility", true);
    this.preventMinimize = this.kwinApi.KWin.readConfig("preventMinimize", false);
    this.preventProtrusion = this.kwinApi.KWin.readConfig("preventProtrusion", true);
    this.pollMouseXdotool = this.kwinApi.KWin.readConfig("pollMouseXdotool", false);

    this.floatingClass = commaSeparate(this.kwinApi.KWin.readConfig("floatingClass", ""));
    this.floatingTitle = commaSeparate(this.kwinApi.KWin.readConfig("floatingTitle", ""));
    this.ignoreActivity = commaSeparate(this.kwinApi.KWin.readConfig("ignoreActivity", ""));
    this.ignoreClass = commaSeparate(
      this.kwinApi.KWin.readConfig("ignoreClass", "krunner,yakuake,spectacle,kded5")
    );
    this.ignoreRole = commaSeparate(this.kwinApi.KWin.readConfig("ignoreRole", "quake"));

    this.ignoreScreen = commaSeparate(this.kwinApi.KWin.readConfig("ignoreScreen", "")).map(
      (str) => parseInt(str, 10)
    );
    this.ignoreTitle = commaSeparate(this.kwinApi.KWin.readConfig("ignoreTitle", ""));

  }

  public toString(): string {
    return "Config(" + JSON.stringify(this, undefined, 2) + ")";
  }
}