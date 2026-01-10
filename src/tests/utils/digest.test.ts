import { describe, it, expect } from 'vitest'
import { calculatePeriods, groupVideosByPeriod, generateDigestXml } from '~/server/utils/digest'
import type { DigestFeedConfig, DigestItem } from '~/types/digest'

describe('calculatePeriods', () => {
  it('calculates correct periods from epoch', () => {
    // Mock: today is Jan 10, 2026
    const originalDate = Date
    const mockDate = new Date('2026-01-10T12:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)

    const periods = calculatePeriods('2026-01-01', 3, 10)

    // Should have 3 complete periods: Jan 1-3, Jan 4-6, Jan 7-9
    // Jan 10-12 is incomplete, so not included
    expect(periods.length).toBe(3)

    expect(periods[0].periodId).toBe('2026-01-01')
    expect(periods[0].startDate.toISOString()).toBe('2026-01-01T00:00:00.000Z')
    expect(periods[0].endDate.toISOString()).toBe('2026-01-04T00:00:00.000Z')

    expect(periods[1].periodId).toBe('2026-01-04')
    expect(periods[1].startDate.toISOString()).toBe('2026-01-04T00:00:00.000Z')
    expect(periods[1].endDate.toISOString()).toBe('2026-01-07T00:00:00.000Z')

    expect(periods[2].periodId).toBe('2026-01-07')
    expect(periods[2].startDate.toISOString()).toBe('2026-01-07T00:00:00.000Z')
    expect(periods[2].endDate.toISOString()).toBe('2026-01-10T00:00:00.000Z')

    vi.useRealTimers()
  })

  it('respects maxPeriods limit', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-20T12:00:00Z'))

    const periods = calculatePeriods('2026-01-01', 3, 2)

    // Should only return last 2 periods even though more exist
    expect(periods.length).toBe(2)
    expect(periods[0].periodId).toBe('2026-01-13')
    expect(periods[1].periodId).toBe('2026-01-16')

    vi.useRealTimers()
  })

  it('returns empty array when epoch is in the future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-05T12:00:00Z'))

    const periods = calculatePeriods('2026-01-10', 3, 10)

    expect(periods.length).toBe(0)

    vi.useRealTimers()
  })

  it('excludes current incomplete period', () => {
    vi.useFakeTimers()
    // Jan 8 is mid-period (Jan 7-9)
    vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

    const periods = calculatePeriods('2026-01-01', 3, 10)

    // Should have 2 periods: Jan 1-3, Jan 4-6
    // Jan 7-9 is incomplete
    expect(periods.length).toBe(2)
    expect(periods[1].periodId).toBe('2026-01-04')

    vi.useRealTimers()
  })
})

describe('groupVideosByPeriod', () => {
  const mockPeriods = [
    {
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-01-04T00:00:00Z'),
      periodId: '2026-01-01'
    },
    {
      startDate: new Date('2026-01-04T00:00:00Z'),
      endDate: new Date('2026-01-07T00:00:00Z'),
      periodId: '2026-01-04'
    }
  ]

  it('groups videos correctly by processedAt date', () => {
    const summaries = [
      { title: 'Video 1', videoId: 'v1', channel: 'Ch1', processedAt: '2026-01-02T10:00:00Z' },
      { title: 'Video 2', videoId: 'v2', channel: 'Ch2', processedAt: '2026-01-03T10:00:00Z' },
      { title: 'Video 3', videoId: 'v3', channel: 'Ch3', processedAt: '2026-01-05T10:00:00Z' }
    ]

    const result = groupVideosByPeriod(summaries, mockPeriods, 'https://example.com')

    expect(result.length).toBe(2)

    // Results are sorted newest first
    const firstPeriod = result.find(r => r.period.periodId === '2026-01-04')
    const secondPeriod = result.find(r => r.period.periodId === '2026-01-01')

    expect(firstPeriod?.videos.length).toBe(1)
    expect(firstPeriod?.videos[0].videoId).toBe('v3')

    expect(secondPeriod?.videos.length).toBe(2)
    expect(secondPeriod?.videos.map(v => v.videoId)).toContain('v1')
    expect(secondPeriod?.videos.map(v => v.videoId)).toContain('v2')
  })

  it('excludes empty periods', () => {
    const summaries = [
      { title: 'Video 1', videoId: 'v1', channel: 'Ch1', processedAt: '2026-01-02T10:00:00Z' }
    ]

    const result = groupVideosByPeriod(summaries, mockPeriods, 'https://example.com')

    // Only one period should have videos
    expect(result.length).toBe(1)
    expect(result[0].period.periodId).toBe('2026-01-01')
  })

  it('handles videos without processedAt', () => {
    const summaries = [
      { title: 'Video 1', videoId: 'v1', channel: 'Ch1', processedAt: '2026-01-02T10:00:00Z' },
      { title: 'Video 2', videoId: 'v2', channel: 'Ch2' } // Missing processedAt
    ]

    const result = groupVideosByPeriod(summaries, mockPeriods, 'https://example.com')

    // Only video with processedAt should be included
    expect(result.length).toBe(1)
    expect(result[0].videos.length).toBe(1)
  })

  it('handles boundary dates correctly (exclusive end)', () => {
    const summaries = [
      // Exactly at period boundary (midnight Jan 4) - should go to second period
      { title: 'Boundary Video', videoId: 'vb', channel: 'Ch', processedAt: '2026-01-04T00:00:00Z' }
    ]

    const result = groupVideosByPeriod(summaries, mockPeriods, 'https://example.com')

    expect(result.length).toBe(1)
    expect(result[0].period.periodId).toBe('2026-01-04') // Second period
  })

  it('generates correct URLs', () => {
    const summaries = [
      { title: 'Video 1', videoId: 'abc123', channel: 'Ch1', processedAt: '2026-01-02T10:00:00Z', youtubeUrl: 'https://youtube.com/watch?v=abc123' }
    ]

    const result = groupVideosByPeriod(summaries, mockPeriods, 'https://example.com')

    expect(result[0].videos[0].summaryUrl).toBe('https://example.com/summaries/abc123')
    expect(result[0].videos[0].youtubeUrl).toBe('https://youtube.com/watch?v=abc123')
  })

  it('uses placeholder for missing tldr', () => {
    const summaries = [
      { title: 'Video 1', videoId: 'v1', channel: 'Ch1', processedAt: '2026-01-02T10:00:00Z' } // No tldr
    ]

    const result = groupVideosByPeriod(summaries, mockPeriods, 'https://example.com')

    expect(result[0].videos[0].tldr).toBe(null)
  })
})

describe('generateDigestXml', () => {
  const mockConfig: DigestFeedConfig = {
    siteUrl: 'https://example.com',
    title: 'Test Digest',
    description: 'Test Description',
    introText: 'Welcome to the digest!',
    footerText: 'Thanks for reading!',
    periodDays: 3,
    epochDate: '2026-01-01',
    maxPeriods: 10,
    language: 'en-us'
  }

  const mockItems: DigestItem[] = [
    {
      period: {
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-01-04T00:00:00Z'),
        periodId: '2026-01-01'
      },
      videos: [
        {
          title: 'Test Video',
          videoId: 'v1',
          channel: 'Test Channel',
          tldr: 'This is a test summary',
          summaryUrl: 'https://example.com/summaries/v1',
          youtubeUrl: 'https://youtube.com/watch?v=v1',
          processedAt: '2026-01-02T10:00:00Z'
        }
      ]
    }
  ]

  it('generates valid RSS 2.0 XML structure', () => {
    const xml = generateDigestXml(mockItems, mockConfig)

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('</channel>')
    expect(xml).toContain('</rss>')
  })

  it('includes feed metadata', () => {
    const xml = generateDigestXml(mockItems, mockConfig)

    expect(xml).toContain('<title>Test Digest</title>')
    expect(xml).toContain('<link>https://example.com</link>')
    expect(xml).toContain('<description>Test Description</description>')
    expect(xml).toContain('<language>en-us</language>')
    expect(xml).toContain('<atom:link href="https://example.com/digest.xml"')
  })

  it('generates correct item structure', () => {
    const xml = generateDigestXml(mockItems, mockConfig)

    expect(xml).toContain('<item>')
    expect(xml).toContain('YouTube Digest: Jan 1-3, 2026')
    expect(xml).toContain('<link>https://example.com/digest/2026-01-01</link>')
    expect(xml).toContain('<guid isPermaLink="true">https://example.com/digest/2026-01-01</guid>')
    expect(xml).toContain('</item>')
  })

  it('includes intro and footer text in description', () => {
    const xml = generateDigestXml(mockItems, mockConfig)

    expect(xml).toContain('Welcome to the digest!')
    expect(xml).toContain('Thanks for reading!')
  })

  it('includes video details in description', () => {
    const xml = generateDigestXml(mockItems, mockConfig)

    expect(xml).toContain('Test Video')
    expect(xml).toContain('This is a test summary')
    expect(xml).toContain('Test Channel')
    expect(xml).toContain('https://example.com/summaries/v1')
    expect(xml).toContain('https://youtube.com/watch?v=v1')
  })

  it('escapes XML special characters', () => {
    const itemsWithSpecialChars: DigestItem[] = [
      {
        period: mockItems[0].period,
        videos: [
          {
            title: 'Video with <special> & "chars"',
            videoId: 'v1',
            channel: 'Channel & Co',
            tldr: 'Summary with <tags>',
            summaryUrl: 'https://example.com/summaries/v1',
            youtubeUrl: 'https://youtube.com/watch?v=v1',
            processedAt: '2026-01-02T10:00:00Z'
          }
        ]
      }
    ]

    const xml = generateDigestXml(itemsWithSpecialChars, mockConfig)

    expect(xml).toContain('&lt;special&gt;')
    expect(xml).toContain('&amp;')
    expect(xml).toContain('&quot;')
  })

  it('returns empty items list when no digest items', () => {
    const xml = generateDigestXml([], mockConfig)

    expect(xml).toContain('<channel>')
    expect(xml).not.toContain('<item>')
  })

  it('uses placeholder for missing tldr', () => {
    const itemsWithoutTldr: DigestItem[] = [
      {
        period: mockItems[0].period,
        videos: [
          {
            title: 'Video',
            videoId: 'v1',
            channel: 'Channel',
            tldr: null,
            summaryUrl: 'https://example.com/summaries/v1',
            youtubeUrl: 'https://youtube.com/watch?v=v1',
            processedAt: '2026-01-02T10:00:00Z'
          }
        ]
      }
    ]

    const xml = generateDigestXml(itemsWithoutTldr, mockConfig)

    expect(xml).toContain('Summary available on site')
  })
})

// Import vi for mocking
import { vi } from 'vitest'
