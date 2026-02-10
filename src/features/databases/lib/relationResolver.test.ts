import { describe, it, expect } from 'vitest'
import { resolveRelation, getRelatedRows, aggregateValues } from './relationResolver'
import type { DbRow, DbField, DbTable, CellValue } from '../types'
import { DbFieldType, RollupAggregation } from '../types'

// ─── Test Fixtures ──────────────────────────────────────────────────

function makeRow(id: string, cells: Record<string, CellValue>): DbRow {
  return { id, cells, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }
}

// Projects table: id, Name, Budget
const projectFields: DbField[] = [
  { id: 'pf1', name: 'Name', type: DbFieldType.Text, width: 280 },
  { id: 'pf2', name: 'Budget', type: DbFieldType.Number, width: 160 },
  { id: 'pf3', name: 'Status', type: DbFieldType.Text, width: 160 },
]

const projectRows: DbRow[] = [
  makeRow('proj1', { pf1: 'Alpha', pf2: 1000, pf3: 'Active' }),
  makeRow('proj2', { pf1: 'Beta', pf2: 2000, pf3: 'Active' }),
  makeRow('proj3', { pf1: 'Gamma', pf2: 3000, pf3: '' }),
]

const projectsTable: DbTable = {
  id: 'projects',
  name: 'Projects',
  icon: '📁',
  fields: projectFields,
  rows: projectRows,
  views: [],
}

// Tasks table: id, Title, relation to Projects, lookup on Project Name, rollup on Budget
const taskRelationField: DbField = {
  id: 'tf_rel',
  name: 'Project',
  type: DbFieldType.Relation,
  width: 200,
  relationConfig: {
    targetTableId: 'projects',
    targetFieldId: 'pf1',
    allowMultiple: true,
  },
}

const taskLookupField: DbField = {
  id: 'tf_lookup',
  name: 'Project Name',
  type: DbFieldType.Lookup,
  width: 200,
  lookupConfig: {
    relationFieldId: 'tf_rel',
    targetFieldId: 'pf1',
  },
}

const taskRollupField: DbField = {
  id: 'tf_rollup',
  name: 'Total Budget',
  type: DbFieldType.Rollup,
  width: 160,
  rollupConfig: {
    relationFieldId: 'tf_rel',
    targetFieldId: 'pf2',
    aggregation: RollupAggregation.Sum,
  },
}

const taskTitleField: DbField = {
  id: 'tf_title',
  name: 'Title',
  type: DbFieldType.Text,
  width: 280,
}

const taskFields: DbField[] = [taskTitleField, taskRelationField, taskLookupField, taskRollupField]

const tables: Record<string, DbTable> = {
  projects: projectsTable,
}

describe('relationResolver', () => {
  describe('getRelatedRows', () => {
    it('returns matching rows from target table', () => {
      const result = getRelatedRows(['proj1', 'proj2'], 'projects', tables)
      expect(result).toHaveLength(2)
      expect(result[0]!.id).toBe('proj1')
      expect(result[1]!.id).toBe('proj2')
    })

    it('returns empty array for missing table', () => {
      const result = getRelatedRows(['proj1'], 'nonexistent', tables)
      expect(result).toHaveLength(0)
    })

    it('filters out non-existent row IDs', () => {
      const result = getRelatedRows(['proj1', 'missing_id'], 'projects', tables)
      expect(result).toHaveLength(1)
      expect(result[0]!.id).toBe('proj1')
    })
  })

  describe('resolveRelation', () => {
    it('resolves relation field to linked row IDs', () => {
      const taskRow = makeRow('t1', { tf_title: 'Task 1', tf_rel: ['proj1', 'proj2'] })
      const result = resolveRelation(taskRow, taskRelationField, tables, taskFields)
      expect(result).toEqual(['proj1', 'proj2'])
    })

    it('resolves lookup field through relation', () => {
      const taskRow = makeRow('t1', { tf_title: 'Task 1', tf_rel: ['proj1', 'proj2'] })
      const result = resolveRelation(taskRow, taskLookupField, tables, taskFields)
      expect(result).toBe('Alpha, Beta')
    })

    it('resolves rollup field with sum aggregation', () => {
      const taskRow = makeRow('t1', { tf_title: 'Task 1', tf_rel: ['proj1', 'proj2'] })
      const result = resolveRelation(taskRow, taskRollupField, tables, taskFields)
      expect(result).toBe(3000) // 1000 + 2000
    })

    it('returns null when relation cell is empty', () => {
      const taskRow = makeRow('t1', { tf_title: 'Task 1' })
      const lookupResult = resolveRelation(taskRow, taskLookupField, tables, taskFields)
      expect(lookupResult).toBe(null)
    })
  })

  describe('aggregateValues', () => {
    it('computes count', () => {
      expect(aggregateValues([1, 2, 3, null], 'count')).toBe(4)
    })

    it('computes avg', () => {
      expect(aggregateValues([10, 20, 30], 'avg')).toBe(20)
    })

    it('computes min and max', () => {
      expect(aggregateValues([5, 15, 10], 'min')).toBe(5)
      expect(aggregateValues([5, 15, 10], 'max')).toBe(15)
    })

    it('computes percent_empty and percent_filled', () => {
      const vals: CellValue[] = ['a', '', null, 'b']
      expect(aggregateValues(vals, 'percent_empty')).toBe(50)
      expect(aggregateValues(vals, 'percent_filled')).toBe(50)
    })
  })
})
