// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "qml-plugin.hpp"

#include <QString>

#include <memory>

#include "config.hpp"

void CorePlugin::registerTypes(const char *uri)
{
    Q_ASSERT(qstrcmp(uri, "org.kde.bismuth.core") == 0);
    qmlRegisterModule(uri, 1, 0);

    qmlRegisterType<Core>(uri, 1, 0, "Core");
}

Core::Core(QQuickItem *parent)
    : QQuickItem(parent)
    , m_kwinApi()
    , m_qmlElements()
    , m_config(std::make_unique<Bismuth::Config>())
{
}

void Core::start()
{
}

QJSValue Core::jsCompatibleConfig(QJSValue emptyObject)
{
    auto setProp = [&emptyObject](const char *propName, const QJSValue &value) {
        emptyObject.setProperty(QString::fromUtf8(propName), value);
    };

    auto layoutOrderProp = emptyObject.property(QStringLiteral("layoutOrder"));

    auto arrayIndexCounter = 0;
    auto addLayout = [&arrayIndexCounter, &layoutOrderProp, this](const char *configKey, const char *layoutId) {
        auto layoutEnabled = m_config->property(configKey).toBool();
        if (layoutEnabled) {
            layoutOrderProp.setProperty(arrayIndexCounter, QString::fromUtf8(layoutId));
            arrayIndexCounter++;
        }
    };

    // HACK: We have to hardcode layoutIds here for now
    addLayout("enableTileLayout", "TileLayout");
    addLayout("enableMonocleLayout", "MonocleLayout");
    addLayout("enableThreeColumnLayout", "ThreeColumnLayout");
    addLayout("enableSpreadLayout", "SpreadLayout");
    addLayout("enableStairLayout", "StairLayout");
    addLayout("enableSpiralLayout", "SpiralLayout");
    addLayout("enableQuarterLayout", "QuarterLayout");
    addLayout("enableFloatingLayout", "FloatingLayout");
    addLayout("enableCascadeLayout", "CascadeLayout");

    setProp("monocleMaximize", m_config->monocleMaximize());
    setProp("maximizeSoleTile", m_config->maximizeSoleTile());
    setProp("monocleMinimizeRest", m_config->monocleMinimizeRest());

    setProp("keepFloatAbove", m_config->keepFloatAbove());
    setProp("noTileBorder", m_config->noTileBorder());

    if (m_config->limitTileWidth()) {
        setProp("limitTileWidthRatio", m_config->limitTileWidthRatio());
    } else {
        setProp("limitTileWidthRatio", 0);
    }

    setProp("screenGapBottom", m_config->screenGapBottom());
    setProp("screenGapLeft", m_config->screenGapLeft());
    setProp("screenGapRight", m_config->screenGapRight());
    setProp("screenGapTop", m_config->screenGapTop());
    setProp("tileLayoutGap", m_config->tileLayoutGap());

    setProp("newWindowAsMaster", m_config->newWindowAsMaster());
    setProp("layoutPerActivity", m_config->layoutPerActivity());
    setProp("layoutPerDesktop", m_config->layoutPerDesktop());

    setProp("preventMinimize", m_config->preventMinimize());
    setProp("preventProtrusion", m_config->preventProtrusion());

    setProp("floatUtility", m_config->floatUtility());

    auto setStrArrayProp = [&emptyObject](const char *propName, const QString &commaSeparatedString, bool asNumbers = false) {
        auto strList = commaSeparatedString.split(QLatin1Char(','), Qt::SkipEmptyParts);

        auto arrayProperty = emptyObject.property(QString::fromUtf8(propName));

        for (auto i = 0; i < strList.size(); ++i) {
            auto value = strList.at(i);
            if (asNumbers) {
                arrayProperty.setProperty(i, value.toInt());
            } else {
                arrayProperty.setProperty(i, value);
            }
        }
    };

    setStrArrayProp("floatingClass", m_config->floatingClass());
    setStrArrayProp("floatingTitle", m_config->floatingTitle());
    setStrArrayProp("ignoreClass", m_config->ignoreClass());
    setStrArrayProp("ignoreTitle", m_config->ignoreTitle());
    setStrArrayProp("ignoreRole", m_config->ignoreRole());

    setStrArrayProp("ignoreActivity", m_config->ignoreActivity());
    setStrArrayProp("ignoreScreen", m_config->ignoreScreen(), true);

    setProp("debugEnabled", m_config->debug());

    return emptyObject;
}

QJSValue Core::kwinApi()
{
    return m_kwinApi;
};

void Core::setKwinApi(const QJSValue &kwinApi)
{
    m_kwinApi = kwinApi;
};

QJSValue Core::qmlElements()
{
    return m_kwinApi;
}

void Core::setQmlElements(const QJSValue &qmlElements)
{
    m_qmlElements = qmlElements;
};
