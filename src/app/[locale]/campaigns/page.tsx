"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
  Skeleton,
  InputAdornment,
  Card,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useTranslations } from "next-intl";
import CampaignCard from "@/components/ui/CampaignCard";
import EmptyState from "@/components/ui/EmptyState";

const ITEMS_PER_PAGE = 9;

export default function CampaignsPage() {
  const t = useTranslations("campaigns");
  const { campaigns, isLoading } = useCampaigns();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const filteredCampaigns = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now() / 1000;
    return campaigns
      .filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = category === "All" || c.category === category;

        const matchesStatus =
          status === "All" ||
          (status === "Active" && "active" in c.status) ||
          (status === "Completed" && "completed" in c.status) ||
          (status === "Closed" && "closed" in c.status);

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return parseInt(b.deadline) - parseInt(a.deadline); // ponytail: simple proxy for creation order
        }
        if (sortBy === "most_funded") {
          return (parseFloat(b.currentAmount) || 0) - (parseFloat(a.currentAmount) || 0);
        }
        if (sortBy === "ending_soon") {
          const aTimeLeft = parseInt(a.deadline) - now;
          const bTimeLeft = parseInt(b.deadline) - now;
          // Filter out ended ones from being prioritized
          if (aTimeLeft < 0 && bTimeLeft >= 0) return 1;
          if (bTimeLeft < 0 && aTimeLeft >= 0) return -1;
          return aTimeLeft - bTimeLeft;
        }
        return 0;
      });
  }, [campaigns, search, category, status, sortBy]);

  const pageCount = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);
  const paginatedCampaigns = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredCampaigns.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCampaigns, page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 6 }}>
        <Typography variant="h2" sx={{ fontSize: "2.4rem" }}>
          {t("title")}
        </Typography>
        {!isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {filteredCampaigns.length} campaigns found
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          p: 3,
          mb: 5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ fontSize: 20, color: "#5C5C70" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("filterCategory")}</InputLabel>
              <Select
                value={category}
                label={t("filterCategory")}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Kesehatan">Kesehatan</MenuItem>
                <MenuItem value="Pendidikan">Pendidikan</MenuItem>
                <MenuItem value="Bencana">Bencana</MenuItem>
                <MenuItem value="Sosial">Sosial</MenuItem>
                <MenuItem value="Lainnya">Lainnya</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("sortBy")}</InputLabel>
              <Select
                value={sortBy}
                label={t("sortBy")}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">{t("sortNewest")}</MenuItem>
                <MenuItem value="most_funded">{t("sortMostFunded")}</MenuItem>
                <MenuItem value="ending_soon">{t("sortEndingSoon")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <ToggleButtonGroup
              fullWidth
              size="small"
              value={status}
              exclusive
              onChange={(e, val) => {
                if (val !== null) {
                  setStatus(val);
                  setPage(1);
                }
              }}
              sx={{
                "& .MuiToggleButton-root": {
                  border: "1px solid #E2E2EC",
                  borderRadius: 1,
                  fontWeight: 700,
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      backgroundColor: "primary.main",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="All">All</ToggleButton>
              <ToggleButton value="Active">Active</ToggleButton>
              <ToggleButton value="Completed">Done</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 6].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card sx={{ height: 350, border: "1px solid #E2E2EC" }}>
                <Skeleton variant="rectangular" height={180} />
                <Box sx={{ p: 3 }}>
                  <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
                  <Skeleton width="90%" height={32} sx={{ mb: 2 }} />
                  <Skeleton width="100%" height={16} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDesc")}
          actionLabel={t("emptyAction")}
          actionPath="/create"
        />
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedCampaigns.map((campaign) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign.pubkey}>
                <CampaignCard campaign={campaign} />
              </Grid>
            ))}
          </Grid>

          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
