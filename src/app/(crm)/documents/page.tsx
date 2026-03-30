'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Badge from '@/components/Badge'
import { createClient } from '@/lib/supabase'
import type { Document } from '@/types'

export default function DocumentsPage() {
  const supabase = createClient()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [scanning, setScanning] = useState<string | null>(null) // docId being scanned
  const [progress, setProgress] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function fetchDocs() {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    setDocuments(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  async function handleFile(file: File) {
    if (!file) return
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setError('Only PDF and image files are supported.')
      return
    }
    setError('')

    // Create Pending document record
    const { data: docRecord, error: insertErr } = await supabase
      .from('documents')
      .insert({ file_name: file.name, status: 'Pending', file_url: null, extracted_data: null })
      .select()
      .single()

    if (insertErr || !docRecord) {
      setError('Failed to create document record.')
      return
    }

    await fetchDocs()
    setScanning(docRecord.id)
    setProgress(10)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      setProgress(30)

      // Update to Processing
      await supabase
        .from('documents')
        .update({ status: 'Processing' })
        .eq('id', docRecord.id)
      setProgress(50)
      await fetchDocs()

      // Call scan API
      const res = await fetch('/api/docs/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          fileName: file.name,
          docId: docRecord.id,
        }),
      })

      setProgress(90)

      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Scan failed.')
      }

      setProgress(100)
      setTimeout(async () => {
        setScanning(null)
        setProgress(0)
        await fetchDocs()
      }, 600)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function formatExtracted(data: Record<string, unknown> | null) {
    if (!data) return []
    return Object.entries(data).map(([k, v]) => ({
      key: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: String(v),
    }))
  }

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-glr-gray-dark">Documents</h1>
          <p className="text-glr-gray text-sm mt-1">Upload and scan real estate documents with AI</p>
        </div>

        {/* Upload zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
            dragging
              ? 'border-glr-green bg-glr-green-light'
              : 'border-gray-200 bg-white hover:border-glr-green hover:bg-glr-green-light/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
          <svg className="w-10 h-10 text-glr-green mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          <p className="font-semibold text-glr-gray-dark">Drop a file here or click to browse</p>
          <p className="text-sm text-glr-gray mt-1">Supports PDF, PNG, JPG, WEBP</p>
        </div>

        {/* Scan progress */}
        {scanning && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 animate-fade-up">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-glr-gray-dark">Scanning document with AI…</span>
              <span className="text-glr-green font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-glr-green-light rounded-full overflow-hidden">
              <div
                className="h-full bg-glr-green rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* Documents list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-glr-gray p-4">Loading…</div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-glr-gray text-sm">
              No documents yet. Upload your first document above.
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-glr-gray-light/30 transition-colors"
                  onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-glr-green-light flex items-center justify-center flex-shrink-0">
                      {doc.file_name.endsWith('.pdf') ? (
                        <svg className="w-5 h-5 text-glr-green" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-glr-green" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-glr-gray-dark">{doc.file_name}</p>
                      <p className="text-xs text-glr-gray">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={doc.status} />
                    <svg
                      className={`w-4 h-4 text-glr-gray transition-transform ${
                        expanded === doc.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded extracted data */}
                {expanded === doc.id && doc.extracted_data && (
                  <div className="border-t border-glr-green-mid bg-glr-green-light px-6 py-5 animate-fade-up">
                    <p className="text-xs font-semibold text-glr-green-dark uppercase tracking-wider mb-3">
                      Extracted Data
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formatExtracted(doc.extracted_data).map(({ key, value }) => (
                        <div key={key} className="bg-white rounded-lg px-4 py-3 shadow-sm">
                          <p className="text-xs text-glr-gray mb-0.5">{key}</p>
                          <p className="text-sm font-medium text-glr-gray-dark">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {expanded === doc.id && !doc.extracted_data && (
                  <div className="border-t border-gray-100 px-6 py-4 text-sm text-glr-gray">
                    {doc.status === 'Pending' || doc.status === 'Processing'
                      ? 'Document is being processed…'
                      : 'No extracted data available.'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
