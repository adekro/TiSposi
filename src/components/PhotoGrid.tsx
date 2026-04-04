import { useState } from 'react'
import {
  Box,
  Card,
  CardMedia,
  ImageList,
  ImageListItem,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { GalleryItem } from '../types'

interface PhotoGridProps {
  items: GalleryItem[]
  loading: boolean
}

export default function PhotoGrid({ items, loading }: PhotoGridProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const cols = isMobile ? 2 : 3

  const [lightboxIndex, setLightboxIndex] = useState<number>(-1)

  // Solo le foto (non le dediche) vanno nel lightbox
  const photos = items.filter((i) => i.type === 'photo')
  const slides = photos.map((p) => ({ src: p.url! }))

  if (loading && items.length === 0) {
    return (
      <ImageList cols={cols} gap={8} sx={{ mt: 1 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ImageListItem key={i}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
          </ImageListItem>
        ))}
      </ImageList>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: '"Playfair Display", serif' }}>
          Nessuna foto ancora…
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sii il primo a scattare una foto!
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <ImageList cols={cols} gap={8} sx={{ mt: 1, overflowY: 'visible' }}>
        {items.map((item) => {
          if (item.type === 'dedica') {
            return (
              <ImageListItem key={item.id} cols={1}>
                <Card
                  sx={{
                    height: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.light}22, ${theme.palette.primary.light}22)`,
                    border: `1px solid ${theme.palette.secondary.light}`,
                  }}
                >
                  <EditIcon color="secondary" sx={{ mb: 0.5, fontSize: 20 }} />
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.text}
                  </Typography>
                </Card>
              </ImageListItem>
            )
          }

          // Trova l'indice nel lightbox (solo foto)
          const photoIdx = photos.findIndex((p) => p.id === item.id)

          return (
            <ImageListItem key={item.id}>
              <CardMedia
                component="img"
                image={item.url}
                alt="Foto matrimonio"
                loading="lazy"
                onClick={() => setLightboxIndex(photoIdx)}
                sx={{
                  height: 160,
                  objectFit: 'cover',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              />
            </ImageListItem>
          )
        })}
      </ImageList>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
      />
    </>
  )
}
