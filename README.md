# ValidateTitleField GUI Extension for Tridion 8.5

This will block attempts to save or check-in a component in Tridion 8.5 if the component contains diacritics (é, á, ¢)

# Installation

## Add assets to the Tridion Server

1. On a drive (`D:\`) create a folder named something like `CMS\GUIExtensions\ValidateTitleField`
2. Copy the `Configuration` and `Scripts` folders from this project

## Create a Virtual Directory in IIS

1. Open IIS and expand the `SDL Web` site
2. Expand `WebUI/Editors`
3. Create a virtual directory that points to the physical location you created. Call it `ValidateTitleField`

## Edit the Tridion System Configuration

1. Open the file explorer and navigate to `SDL Web\web\WebUI\WebRoot\Configuration`
2. Open `System.config`
3. Add the following at the end of the `editors` node:

```xml
	<editor name="ValidateTitleField">
		<installpath>D:\CMS\GUIExtensions\ValidateTitleField\</installpath>
		<configuration>Configuration\ValidateTitleField.config</configuration>
		<vdir>ValidateTitleField</vdir>
	</editor>
```