// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "number-sum" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "number-sum.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from number-sum!")
    }
  )

  // 숫자 합계 계산 명령 등록
  const sumCommand = vscode.commands.registerCommand(
    "number-sum.calculateSum",
    () => {
      calculateSum()
    }
  )

  // 상태바 아이템 생성
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  )

  // 자동 계산 상태 표시 아이템
  const autoCalculateStatusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    99
  )

  // 디바운스 타이머
  let debounceTimer: NodeJS.Timeout | undefined

  // 자동 계산 설정 변경 감지
  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(
    (e) => {
      if (e.affectsConfiguration("numberSum.autoCalculate")) {
        updateAutoCalculateStatus()
      }
    }
  )

  // 자동 계산 상태 업데이트
  function updateAutoCalculateStatus() {
    const config = vscode.workspace.getConfiguration("numberSum")
    const isEnabled = config.get("autoCalculate", true)

    autoCalculateStatusItem.text = isEnabled
      ? "$(check) Auto Calculate"
      : "$(close) Auto Calculate"
    autoCalculateStatusItem.tooltip = isEnabled
      ? "Auto sum calculation is enabled"
      : "Auto sum calculation is disabled"
    autoCalculateStatusItem.show()
  }

  // 자동 계산 토글 명령
  const toggleCommand = vscode.commands.registerCommand(
    "number-sum.toggleAutoCalculate",
    () => {
      const config = vscode.workspace.getConfiguration("numberSum")
      const currentValue = config.get("autoCalculate", true)
      config.update("autoCalculate", !currentValue, true)
    }
  )

  // 선택 변경 이벤트 처리
  const selectionChangeDisposable =
    vscode.window.onDidChangeTextEditorSelection((event) => {
      const config = vscode.workspace.getConfiguration("numberSum")
      if (!config.get("autoCalculate", true)) {
        return
      }

      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      debounceTimer = setTimeout(() => {
        calculateSum()
      }, 3000) // 3초 딜레이
    })

  // 합계 계산 함수
  function calculateSum() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      statusBarItem.hide()
      return
    }

    const selection = editor.selection
    const text = editor.document.getText(selection)

    // 선택된 텍스트가 없으면 상태바 숨기기
    if (!text) {
      statusBarItem.hide()
      return
    }

    // 줄바꿈으로 분리하고 각 줄에서 숫자 추출
    const numbers = text
      .split("\n")
      .map((line) => {
        // 1000단위 구분자(,) 제거 및 숫자만 추출
        const cleanLine = line.replace(/,/g, "")
        const matches = cleanLine.match(/\d+/g)
        return matches ? matches.map(Number) : []
      })
      .flat()

    // 모든 숫자의 합 계산
    const sum = numbers.reduce((acc, curr) => acc + curr, 0)

    // 상태바에 결과 표시
    statusBarItem.text = `Sum: ${sum.toLocaleString()}`
    statusBarItem.show()
  }

  // 초기 상태 표시
  updateAutoCalculateStatus()

  context.subscriptions.push(
    disposable,
    sumCommand,
    selectionChangeDisposable,
    configChangeDisposable,
    toggleCommand
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
