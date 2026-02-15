import type { WorkflowNodeDefinition } from '../../types'

export const logicNodes: WorkflowNodeDefinition[] = [
  {
    type: 'if_else',
    category: 'logic',
    label: 'If/Else',
    description: 'Conditional branching based on an expression',
    icon: 'git-branch',
    color: '#F59E0B',
    inputs: [{ id: 'in', label: 'Input', type: 'flow' }],
    outputs: [
      { id: 'true', label: 'True', type: 'flow' },
      { id: 'false', label: 'False', type: 'flow' },
    ],
    parameters: [
      { key: 'condition', label: 'Condition', type: 'expression', required: true, placeholder: 'data.status === "active"' },
    ],
    defaultData: { condition: '' },
  },
  {
    type: 'switch',
    category: 'logic',
    label: 'Switch',
    description: 'Multi-way branching based on a value',
    icon: 'list-tree',
    color: '#F59E0B',
    inputs: [{ id: 'in', label: 'Input', type: 'flow' }],
    outputs: [
      { id: 'case_0', label: 'Case 1', type: 'flow' },
      { id: 'case_1', label: 'Case 2', type: 'flow' },
      { id: 'default', label: 'Default', type: 'flow' },
    ],
    parameters: [
      { key: 'field', label: 'Field', type: 'string', required: true, placeholder: 'data.type' },
      { key: 'cases', label: 'Cases', type: 'json', required: true, placeholder: '["typeA", "typeB"]' },
    ],
    defaultData: { field: '', cases: [] },
  },
  {
    type: 'merge',
    category: 'logic',
    label: 'Merge',
    description: 'Wait for multiple inputs then combine results',
    icon: 'git-merge',
    color: '#F59E0B',
    inputs: [
      { id: 'in_0', label: 'Input 1', type: 'flow' },
      { id: 'in_1', label: 'Input 2', type: 'flow' },
    ],
    outputs: [{ id: 'out', label: 'Output', type: 'flow' }],
    parameters: [
      { key: 'mode', label: 'Merge Mode', type: 'select', required: true, options: [{ label: 'Wait All', value: 'wait_all' }, { label: 'Wait Any', value: 'wait_any' }] },
    ],
    defaultData: { mode: 'wait_all' },
  },
  {
    type: 'loop',
    category: 'logic',
    label: 'Loop',
    description: 'Iterate over array items',
    icon: 'repeat',
    color: '#F59E0B',
    inputs: [{ id: 'in', label: 'Input', type: 'flow' }],
    outputs: [
      { id: 'item', label: 'Each Item', type: 'flow' },
      { id: 'done', label: 'Done', type: 'flow' },
    ],
    parameters: [
      { key: 'arrayField', label: 'Array Field', type: 'string', required: true, placeholder: 'data.items' },
    ],
    defaultData: { arrayField: '' },
  },
  {
    type: 'delay',
    category: 'logic',
    label: 'Delay',
    description: 'Wait a specified amount of time',
    icon: 'timer',
    color: '#F59E0B',
    inputs: [{ id: 'in', label: 'Input', type: 'flow' }],
    outputs: [{ id: 'out', label: 'Output', type: 'flow' }],
    parameters: [
      { key: 'duration', label: 'Duration (seconds)', type: 'number', required: true, default: 5 },
    ],
    defaultData: { duration: 5 },
  },
]
