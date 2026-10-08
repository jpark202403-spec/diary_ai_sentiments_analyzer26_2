/**
 * Google Apps Script for Diary Sheet CRUD
 * Spreadsheet ID: 19Kvx8n2FzJNRI-cVbCrykyYqUPHzeE3c8DVwuow8X8g
 * Columns: A: timestamp | B: datetime | C: content
 */

var SPREADSHEET_ID = "19Kvx8n2FzJNRI-cVbCrykyYqUPHzeE3c8DVwuow8X8g";
var SHEET_NAME = "Sheet1";

function getSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // getActiveSpreadsheet 실패 시 openById 사용
  }
  if (!ss) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

/**
 * 1. GET 요청 핸들러 (Read / 조회)
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = params.action || "read";

    if (action === "read") {
      var data = readEntries(params.timestamp);
      return jsonResponse({ success: true, data: data });
    }

    return jsonResponse({ success: false, error: "알 수 없는 action입니다." });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * 2. POST 요청 핸들러 (Create, Update, Delete)
 */
function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var postData = JSON.parse(raw);
    var action = postData.action;

    switch (action) {
      case "create": {
        var createResult = createEntry(postData);
        return jsonResponse({ success: true, message: "등록 완료", data: createResult });
      }
      case "update": {
        var updateResult = updateEntry(postData);
        return jsonResponse({ success: true, message: "수정 완료", data: updateResult });
      }
      case "delete": {
        var deleteResult = deleteEntry(postData.timestamp);
        return jsonResponse({ success: true, message: "삭제 완료", data: deleteResult });
      }
      default:
        return jsonResponse({ success: false, error: "유효하지 않은 action입니다. (create/update/delete)" });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ================= CRUD 함수 =================

/**
 * [C] Create - 신규 일기 추가
 */
function createEntry(data) {
  var sheet = getSheet();
  var timestamp = data.timestamp || new Date().getTime();
  var datetime = data.datetime || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
  var content = data.content || "";

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["timestamp", "datetime", "content"]);
  }

  sheet.appendRow([timestamp, datetime, content]);
  return { timestamp: timestamp, datetime: datetime, content: content };
}

/**
 * [R] Read - 전체 목록 또는 단건 조회
 */
function readEntries(targetTimestamp) {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var entries = [];

  for (var i = 0; i < values.length; i++) {
    entries.push({
      timestamp: values[i][0],
      datetime: values[i][1],
      content: values[i][2]
    });
  }

  if (targetTimestamp) {
    return entries.filter(function(item) {
      return String(item.timestamp) === String(targetTimestamp);
    });
  }

  return entries.reverse();
}

/**
 * [U] Update - 일기 수정
 */
function updateEntry(data) {
  if (!data.timestamp) {
    throw new Error("수정 대상의 timestamp가 필요합니다.");
  }

  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) throw new Error("데이터가 없습니다.");

  var values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(data.timestamp)) {
      var rowIndex = i + 2;

      if (data.datetime) {
        sheet.getRange(rowIndex, 2).setValue(data.datetime);
      }
      if (data.content !== undefined) {
        sheet.getRange(rowIndex, 3).setValue(data.content);
      }

      return {
        timestamp: values[i][0],
        datetime: data.datetime || values[i][1],
        content: data.content !== undefined ? data.content : values[i][2]
      };
    }
  }

  throw new Error("해당 timestamp의 항목을 찾을 수 없습니다.");
}

/**
 * [D] Delete - 일기 삭제
 */
function deleteEntry(targetTimestamp) {
  if (!targetTimestamp) {
    throw new Error("삭제 대상의 timestamp가 필요합니다.");
  }

  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) throw new Error("데이터가 없습니다.");

  var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(targetTimestamp)) {
      var rowIndex = i + 2;
      sheet.deleteRow(rowIndex);
      return { deletedTimestamp: targetTimestamp };
    }
  }

  throw new Error("삭제할 대상 timestamp를 찾을 수 없습니다.");
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
