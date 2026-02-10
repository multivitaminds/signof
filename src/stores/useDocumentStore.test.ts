import { useDocumentStore } from './useDocumentStore'
import {
  DocumentStatus,
  SignerStatus,
  SigningOrder,
} from '../types'
import type { Document } from '../types'

function makeDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: 'test-doc',
    name: 'Test Doc',
    status: DocumentStatus.Pending,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's1', name: 'Alice', email: 'alice@test.com', status: SignerStatus.Pending, signedAt: null, order: 1 },
      { id: 's2', name: 'Bob', email: 'bob@test.com', status: SignerStatus.Pending, signedAt: null, order: 2 },
      { id: 's3', name: 'Carol', email: 'carol@test.com', status: SignerStatus.Pending, signedAt: null, order: 3 },
    ],
    signatures: [],
    audit: [],
    fields: [],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
    ...overrides,
  }
}

beforeEach(() => {
  useDocumentStore.setState({ documents: [] })
})

describe('useDocumentStore - Signing Order', () => {
  it('setSigningOrder changes the document signing order', () => {
    useDocumentStore.setState({ documents: [makeDoc()] })
    useDocumentStore.getState().setSigningOrder('test-doc', SigningOrder.Sequential)
    const doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.signingOrder).toBe(SigningOrder.Sequential)
  })

  it('getActiveSignerId returns null for parallel signing', () => {
    useDocumentStore.setState({ documents: [makeDoc()] })
    expect(useDocumentStore.getState().getActiveSignerId('test-doc')).toBeNull()
  })

  it('getActiveSignerId returns lowest-order pending signer for sequential', () => {
    useDocumentStore.setState({
      documents: [makeDoc({ signingOrder: SigningOrder.Sequential })],
    })
    expect(useDocumentStore.getState().getActiveSignerId('test-doc')).toBe('s1')
  })

  it('canSignerSign returns true for any pending signer in parallel', () => {
    useDocumentStore.setState({ documents: [makeDoc()] })
    expect(useDocumentStore.getState().canSignerSign('test-doc', 's1')).toBe(true)
    expect(useDocumentStore.getState().canSignerSign('test-doc', 's2')).toBe(true)
    expect(useDocumentStore.getState().canSignerSign('test-doc', 's3')).toBe(true)
  })

  it('canSignerSign returns true only for first pending signer in sequential', () => {
    useDocumentStore.setState({
      documents: [makeDoc({ signingOrder: SigningOrder.Sequential })],
    })
    expect(useDocumentStore.getState().canSignerSign('test-doc', 's1')).toBe(true)
    expect(useDocumentStore.getState().canSignerSign('test-doc', 's2')).toBe(false)
    expect(useDocumentStore.getState().canSignerSign('test-doc', 's3')).toBe(false)
  })

  it('signAsSigner enforces sequential order', () => {
    useDocumentStore.setState({
      documents: [makeDoc({ signingOrder: SigningOrder.Sequential })],
    })

    // Try to sign as s2 (out of order) - should not work
    useDocumentStore.getState().signAsSigner('test-doc', 's2', 'data:sig')
    let doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.signers.find((s) => s.id === 's2')?.status).toBe(SignerStatus.Pending)

    // Sign as s1 (correct order) - should work
    useDocumentStore.getState().signAsSigner('test-doc', 's1', 'data:sig')
    doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.signers.find((s) => s.id === 's1')?.status).toBe(SignerStatus.Signed)
  })

  it('after first signer signs sequentially, second can sign', () => {
    useDocumentStore.setState({
      documents: [makeDoc({ signingOrder: SigningOrder.Sequential })],
    })

    useDocumentStore.getState().signAsSigner('test-doc', 's1', 'data:sig')
    expect(useDocumentStore.getState().canSignerSign('test-doc', 's2')).toBe(true)
    expect(useDocumentStore.getState().getActiveSignerId('test-doc')).toBe('s2')
  })
})

describe('useDocumentStore - Pricing Table', () => {
  it('updatePricingTable sets the pricing data', () => {
    useDocumentStore.setState({ documents: [makeDoc()] })
    const pricingData = {
      items: [
        { id: 'p1', item: 'Widget', description: 'A widget', quantity: 2, unitPrice: 25 },
      ],
      taxRate: 8.5,
      currency: 'USD',
    }
    useDocumentStore.getState().updatePricingTable('test-doc', pricingData)
    const doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.pricingTable).toEqual(pricingData)
    expect(doc?.pricingTable?.items).toHaveLength(1)
    expect(doc?.pricingTable?.taxRate).toBe(8.5)
  })
})

describe('useDocumentStore - Document Expiration', () => {
  it('setDocumentExpiration sets the expiration date', () => {
    useDocumentStore.setState({ documents: [makeDoc()] })
    useDocumentStore.getState().setDocumentExpiration('test-doc', '2026-03-01T00:00:00Z')
    const doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.expiresAt).toBe('2026-03-01T00:00:00Z')
  })

  it('setDocumentExpiration clears expiration when null', () => {
    useDocumentStore.setState({
      documents: [makeDoc({ expiresAt: '2026-03-01T00:00:00Z' })],
    })
    useDocumentStore.getState().setDocumentExpiration('test-doc', null)
    const doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.expiresAt).toBeNull()
  })

  it('getExpiredDocuments returns expired non-terminal docs', () => {
    useDocumentStore.setState({
      documents: [
        makeDoc({
          id: 'expired-1',
          expiresAt: '2020-01-01T00:00:00Z',
          status: DocumentStatus.Pending,
        }),
        makeDoc({
          id: 'not-expired',
          expiresAt: '2030-01-01T00:00:00Z',
          status: DocumentStatus.Pending,
        }),
        makeDoc({
          id: 'completed',
          expiresAt: '2020-01-01T00:00:00Z',
          status: DocumentStatus.Completed,
        }),
      ],
    })

    const expired = useDocumentStore.getState().getExpiredDocuments()
    expect(expired).toHaveLength(1)
    expect(expired[0]?.id).toBe('expired-1')
  })

  it('autoExpireDocuments marks expired docs as voided', () => {
    useDocumentStore.setState({
      documents: [
        makeDoc({
          id: 'expired-1',
          expiresAt: '2020-01-01T00:00:00Z',
          status: DocumentStatus.Pending,
        }),
        makeDoc({
          id: 'active-1',
          expiresAt: '2030-01-01T00:00:00Z',
          status: DocumentStatus.Pending,
        }),
      ],
    })

    useDocumentStore.getState().autoExpireDocuments()

    const expired = useDocumentStore.getState().getDocument('expired-1')
    expect(expired?.status).toBe(DocumentStatus.Voided)

    const active = useDocumentStore.getState().getDocument('active-1')
    expect(active?.status).toBe(DocumentStatus.Pending)
  })

  it('autoExpireDocuments adds audit entry', () => {
    useDocumentStore.setState({
      documents: [
        makeDoc({
          id: 'expired-1',
          expiresAt: '2020-01-01T00:00:00Z',
          status: DocumentStatus.Pending,
        }),
      ],
    })

    useDocumentStore.getState().autoExpireDocuments()
    const doc = useDocumentStore.getState().getDocument('expired-1')
    const voidEntry = doc?.audit.find((a) => a.action === 'voided')
    expect(voidEntry).toBeDefined()
    expect(voidEntry?.detail).toBe('Document expired')
  })
})

describe('useDocumentStore - Bulk Send', () => {
  it('creates individual documents for each recipient', () => {
    const template = makeDoc({ id: 'template-1', name: 'Template Doc' })
    useDocumentStore.setState({ documents: [template] })

    const recipients = [
      { name: 'Alice', email: 'alice@test.com' },
      { name: 'Bob', email: 'bob@test.com' },
      { name: 'Carol', email: 'carol@test.com' },
    ]

    const newDocs = useDocumentStore.getState().bulkCreateDocuments(template, recipients)
    expect(newDocs).toHaveLength(3)

    // Each doc should have one signer matching the recipient
    expect(newDocs[0]?.signers[0]?.name).toBe('Alice')
    expect(newDocs[1]?.signers[0]?.name).toBe('Bob')
    expect(newDocs[2]?.signers[0]?.name).toBe('Carol')
  })

  it('sets status to Sent for bulk created docs', () => {
    const template = makeDoc()
    useDocumentStore.setState({ documents: [template] })

    const newDocs = useDocumentStore.getState().bulkCreateDocuments(template, [
      { name: 'Alice', email: 'alice@test.com' },
    ])
    expect(newDocs[0]?.status).toBe(DocumentStatus.Sent)
  })

  it('preserves template name and templateId', () => {
    const template = makeDoc({ name: 'Service Agreement' })
    useDocumentStore.setState({ documents: [template] })

    const newDocs = useDocumentStore.getState().bulkCreateDocuments(template, [
      { name: 'Alice', email: 'alice@test.com' },
    ])
    expect(newDocs[0]?.name).toBe('Service Agreement')
    expect(newDocs[0]?.templateId).toBe('test-doc')
  })

  it('adds bulk created docs to the store', () => {
    const template = makeDoc()
    useDocumentStore.setState({ documents: [template] })

    useDocumentStore.getState().bulkCreateDocuments(template, [
      { name: 'Alice', email: 'alice@test.com' },
      { name: 'Bob', email: 'bob@test.com' },
    ])

    // Template + 2 new docs = 3
    expect(useDocumentStore.getState().documents).toHaveLength(3)
  })
})

describe('useDocumentStore - Document Notes', () => {
  it('addDocumentNote adds a note to the document', () => {
    useDocumentStore.setState({ documents: [makeDoc()] })
    useDocumentStore.getState().addDocumentNote('test-doc', 'This is a test note')

    const doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.notes).toHaveLength(1)
    expect(doc?.notes[0]?.content).toBe('This is a test note')
    expect(doc?.notes[0]?.authorName).toBe('You')
  })

  it('addDocumentNote uses provided author name', () => {
    useDocumentStore.setState({ documents: [makeDoc()] })
    useDocumentStore.getState().addDocumentNote('test-doc', 'A note', 'Alice')

    const doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.notes[0]?.authorName).toBe('Alice')
  })

  it('deleteDocumentNote removes the note', () => {
    useDocumentStore.setState({
      documents: [
        makeDoc({
          notes: [
            { id: 'n1', authorName: 'Alice', content: 'Note 1', createdAt: '2026-02-01T10:00:00Z' },
            { id: 'n2', authorName: 'Bob', content: 'Note 2', createdAt: '2026-02-01T11:00:00Z' },
          ],
        }),
      ],
    })

    useDocumentStore.getState().deleteDocumentNote('test-doc', 'n1')
    const doc = useDocumentStore.getState().getDocument('test-doc')
    expect(doc?.notes).toHaveLength(1)
    expect(doc?.notes[0]?.id).toBe('n2')
  })

  it('notes operations update the updatedAt timestamp', () => {
    useDocumentStore.setState({ documents: [makeDoc()] })
    const beforeUpdate = useDocumentStore.getState().getDocument('test-doc')?.updatedAt

    useDocumentStore.getState().addDocumentNote('test-doc', 'A note')
    const afterUpdate = useDocumentStore.getState().getDocument('test-doc')?.updatedAt

    expect(afterUpdate).not.toBe(beforeUpdate)
  })
})
