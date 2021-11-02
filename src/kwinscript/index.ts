// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import { ConfigImpl } from "./config";
import { Controller, ControllerImpl } from "./controller";
import { LogImpl } from "./util/log";

/**
 * Script entry-point from QML side.
 * @param qmlObjects objects from QML gui. Required for the interaction with QML, as we cannot access globals.
 * @param kwinApi KWin scripting API. Required for interaction with KWin, as we cannot access globals.
 */
export function init(
  qmlObjects: Bismuth.Qml.Main,
  kwinScriptingApi: KWin.Api
): Controller {
  const config = new ConfigImpl(kwinScriptingApi);
  const logger = new LogImpl(config);

  const controller = new ControllerImpl(
    qmlObjects,
    kwinScriptingApi,
    config,
    logger
  );

  controller.start();

  return controller;
}
