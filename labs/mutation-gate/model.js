/* Source-pinned educational data. Observed CI reference and browser-only model are distinct. */
(function(root){
'use strict';
const data={
  "head": "f54efbf87e8091e933bbd653d74250d9329e8529",
  "run": "39065366945",
  "date": "2026-10-17",
  "cases": [
    {
      "id": "live-state-mirror-on-by-default",
      "group": "Live mirror",
      "title": "Opt-in must be the default boundary",
      "protection": "The graphical canvas does not silently accept remote state changes before a user opts in.",
      "sabotage": "Flip liveStateMirrorEnabled from false to true.",
      "assertion": "The page must start with the state mirror OFF.",
      "test": "test_live_state_mirror_is_off_by_default_and_says_so",
      "codeBefore": "let liveStateMirrorEnabled = false;",
      "codeAfter": "let liveStateMirrorEnabled = true;"
    },
    {
      "id": "live-state-mirror-gate-removed",
      "group": "Live mirror",
      "title": "The switch must actually block state changes",
      "protection": "While the mirror is OFF, stateChanged messages arrive but must not replace the user's graph.",
      "sabotage": "Replace the guard against applying stateChanged with an always-false condition.",
      "assertion": "A pushed workflow must not replace the canvas when the mirror reads OFF.",
      "test": "test_live_state_mirror_is_off_by_default_and_says_so",
      "codeBefore": "if (msg.type === 'stateChanged' && !liveStateMirrorEnabled) {",
      "codeAfter": "if (false) {  // gate removed"
    },
    {
      "id": "live-state-mirror-gate-swallows-execution-events",
      "group": "Live mirror",
      "title": "Execution feedback must still work",
      "protection": "Only stateChanged is gated; executionEvent messages still update live run status.",
      "sabotage": "Block the whole WebSocket stream whenever the state mirror is OFF.",
      "assertion": "Node run colouring must still update even with the state mirror OFF.",
      "test": "test_execution_events_flow_while_the_state_mirror_is_off",
      "codeBefore": "if (!liveBridgeEnabled) return;",
      "codeAfter": "if (!liveBridgeEnabled || !liveStateMirrorEnabled) return;"
    },
    {
      "id": "live-bridge-closes-unchanged-inspector",
      "group": "UI and rollback",
      "title": "Keep unsaved input when its node is unchanged",
      "protection": "An inspector editing an unchanged node stays open with its unsaved draft and keyboard focus.",
      "sabotage": "Reintroduce the old behaviour: close the inspector on every pushed update.",
      "assertion": "A remote update to another node must not erase the user's unfinished input.",
      "test": "test_live_bridge_keeps_an_inspector_whose_node_is_unchanged",
      "codeBefore": "const keepInspector = inspectorOpen && nodeUnchanged;",
      "codeAfter": "const keepInspector = false;"
    },
    {
      "id": "live-bridge-restore-removed",
      "group": "UI and rollback",
      "title": "Rollback after a failed drawing update",
      "protection": "If valid-looking incoming data cannot render, the previous graph is restored.",
      "sabotage": "Remove the assignments that restore workflowState and nodeCreationOrder.",
      "assertion": "The original graph remains usable after an unrenderable push.",
      "test": "test_live_bridge_restores_the_previous_state_when_a_valid_push_cannot_render",
      "codeBefore": "workflowState = previousState;\nnodeCreationOrder = previousOrder;",
      "codeAfter": "// previous state is NOT restored"
    },
    {
      "id": "live-bridge-renders-before-try",
      "group": "UI and rollback",
      "title": "Catch errors before they escape",
      "protection": "Potentially failing rendering runs inside the try/catch that performs rollback.",
      "sabotage": "Move a render() call to before the try block.",
      "assertion": "A render failure must reach the rollback rather than crash outside error handling.",
      "test": "test_live_bridge_restores_the_previous_state_when_a_valid_push_cannot_render",
      "codeBefore": "try {\n  render();\n} catch (error) {\n  rollback();\n}",
      "codeAfter": "render();  // happens too early\ntry {\n  render();\n} catch (error) {\n  rollback();\n}"
    },
    {
      "id": "live-bridge-id-shape-removed",
      "group": "Input validation",
      "title": "Reject dangerous ID shapes",
      "protection": "Node and group identifiers must match a narrow pattern before reaching HTML handlers.",
      "sabotage": "Allow almost any nonempty string as an identifier.",
      "assertion": "A hostile ID string must be refused for its own invalid format, not another reason.",
      "test": "test_live_bridge_refuses_a_malformed_push_and_keeps_the_canvas",
      "codeBefore": "const LIVE_BRIDGE_ID = /^[A-Za-z0-9_-]{1,64}$/;",
      "codeAfter": "const LIVE_BRIDGE_ID = /^[\\s\\S]+$/;"
    },
    {
      "id": "live-bridge-reserved-ids-allowed",
      "group": "Input validation",
      "title": "Reject JavaScript's reserved object names",
      "protection": "The validator rejects identifiers like __proto__, constructor and prototype.",
      "sabotage": "Replace the reserved-name list with an empty Set.",
      "assertion": "Reserved names must not be accepted as node or group keys.",
      "test": "test_live_bridge_refuses_a_malformed_push_and_keeps_the_canvas",
      "codeBefore": "new Set(['__proto__', 'constructor', 'prototype'])",
      "codeAfter": "new Set()"
    },
    {
      "id": "live-bridge-entity-type-unchecked",
      "group": "Input validation",
      "title": "Require node types to be strings",
      "protection": "A node's entityType must be text, not a number or unrelated value.",
      "sabotage": "Remove the type check on entityType.",
      "assertion": "Malformed node types must be refused before rendering.",
      "test": "test_live_bridge_refuses_a_malformed_push_and_keeps_the_canvas",
      "codeBefore": "if (typeof node.entityType !== 'string') return reason;",
      "codeAfter": "// entityType no longer checked"
    },
    {
      "id": "live-bridge-group-not-object-unchecked",
      "group": "Input validation",
      "title": "Groups must be objects",
      "protection": "A group must have an object shape rather than null or a scalar.",
      "sabotage": "Remove the plain-object validation for groups.",
      "assertion": "A group whose value is null must be refused.",
      "test": "test_live_bridge_refuses_a_malformed_push_and_keeps_the_canvas",
      "codeBefore": "if (!plain(group)) return reason;",
      "codeAfter": "// group object shape unchecked"
    },
    {
      "id": "live-bridge-group-id-value-unchecked",
      "group": "Input validation",
      "title": "Check group ID values, not only keys",
      "protection": "A group's internal id value must agree with its validated key.",
      "sabotage": "Remove the id-value-versus-key comparison.",
      "assertion": "A harmless key with a hostile group.id value must be refused.",
      "test": "test_live_bridge_refuses_a_malformed_push_and_keeps_the_canvas",
      "codeBefore": "if (group.id !== undefined && group.id !== id) return reason;",
      "codeAfter": "// internal group id value unchecked"
    },
    {
      "id": "live-bridge-group-nodes-unchecked",
      "group": "Input validation",
      "title": "Groups must contain an array of node IDs",
      "protection": "group.nodes must be a list of valid node identifiers, not an object with malicious properties.",
      "sabotage": "Replace the group.nodes type check with a no-op.",
      "assertion": "An object posing as a list must be refused before the group renders.",
      "test": "test_live_bridge_refuses_a_malformed_push_and_keeps_the_canvas",
      "codeBefore": "if (!Array.isArray(group.nodes) || !idsValid) return reason;",
      "codeAfter": "if (false) {  // group.nodes unchecked"
    },
    {
      "id": "live-bridge-group-name-unchecked",
      "group": "Input validation",
      "title": "Group names must be strings",
      "protection": "A group name has a predictable text type.",
      "sabotage": "Remove the string check on group.name.",
      "assertion": "A numeric group name must be refused for the correct reason.",
      "test": "test_live_bridge_refuses_a_malformed_push_and_keeps_the_canvas",
      "codeBefore": "if (group.name !== undefined && typeof group.name !== 'string') return reason;",
      "codeAfter": "// group name type unchecked"
    }
  ],
  "ci": [
    {
      "name": "Anchor integrity",
      "scope": "The 73 source anchors still uniquely target real code.",
      "result": "73/73 intact"
    },
    {
      "name": "Pytest / Python 3.11",
      "scope": "General Python tests in the first runtime version.",
      "result": "309 passed, 2 skipped"
    },
    {
      "name": "Pytest / Python 3.13",
      "scope": "The same general suite in a second runtime version.",
      "result": "309 passed, 2 skipped"
    },
    {
      "name": "UI smoke / Chromium",
      "scope": "Browser-based paths: clicking, state updates and visible behaviour.",
      "result": "37 passed"
    },
    {
      "name": "Mutation Gate",
      "scope": "Intentionally weaken 73 registered controls and require the tests to notice.",
      "result": "73/73 CAUGHT, 0 ESCAPED, 0 BROKEN"
    }
  ]
};
function simulate(id,mode){
  const item=data.cases.find(entry=>entry.id===id);
  if(!item)throw new Error('Unknown mutation id');
  if(!['baseline','mutated','blind','broken'].includes(mode))throw new Error('Unknown simulation mode');
  const status=mode==='baseline'?'PASS':mode==='mutated'?'CAUGHT':mode==='blind'?'ESCAPED':'BROKEN';
  const why={baseline:'The original control is intact; its named test runs and passes.',mutated:'The control is deliberately weakened; the corresponding assertion detects the change.',blind:'Teaching counterexample: a weak test stays green even after the control is removed.',broken:'Teaching counterexample: test setup or mutation anchoring fails, so there is no trustworthy test verdict.'}[mode];
  return {simulation:true,real_execution:false,reference_run:data.run,reference_head:data.head,selected_mutation:id,mode,status,named_test:item.test,explanation:why,observed_in_reference_ci:'CAUGHT',scope_note:mode==='mutated'?'Illustrated outcome matches the source-pinned CI; no test was executed in this browser.':'Hypothetical teaching mode; not a reported outcome of the source-pinned CI.'};
}
root.MutationGateLab=Object.freeze({data:Object.freeze(data),simulate});
})(globalThis);
