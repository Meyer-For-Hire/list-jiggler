# List Jiggler

## Overview

List Jiggler is a simple single page app written in Javascript that provides a list of items to a user and allows them to drag and drop items in the list to rearrange it in their preferred order. The list of items in default order is encoded in the URL in a compact form, and the page includes a share button which provides the full list of items as currently ordered on the page in the same compact form. The app runs entirely in the browser and requires no server storage or other outside resources.

## Creator mode
If List Jiggler is loaded without a list of items, it will display a page that allows the user to add items to the list. The user can add items by typing in the text field and pressing enter. The user can also delete items by pressing the delete button on the item. As the user adds and deletes items, the list is updated and the URL is updated to reflect the current list.

## List Data Format and Encoding
List data is stored in a JSON structure with title and items fields. The items field is an array of strings, each representing an item in the list. For example:

```json
{
  "title": "My List",
  "items": ["Item 1", "Item 2", "Item 3"]
}
```

The list is encoded in the URL by serializing the JSON array using Base64 encoding.

## URL Structure

The top level URL is `/` which provides a page with a brief description of List Jiggler as well two buttons:
* Jiggle My Own List
* Jiggle a Demo List

The "Jiggle My Own List" button takes the user to `/create` where they can create their own list by entering items in the text field and pressing enter.

The "Jiggle a Demo List" button uses the following data to create a list:

```json
{
  "title": "Things I Like To Eat",
  "items": ["apples","oranges","bananas","olives","small, slow-moving children"]
}
```

An existing list can be loaded by accessing https://list-jiggler.meyer4hire.com/list/<encoded-list>, for example: https://list-jiggler.meyer4hire.com/list/ewogICJ0aXRsZSI6ICJUaGluZ3MgSSBMaWtlIFRvIEVhdCIsCiAgIml0ZW1zIjogWyJhcHBsZXMiLCJvcmFuZ2VzIiwiYmFuYW5hcyIsIm9saXZlcyIsInNtYWxsLCBzbG93LW1vdmluZyBjaGlsZHJlbiJdCn0K

## Deployment
List Jiggler can be loaded into your browser locally or deployed as a static page on a web server.


