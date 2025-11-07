class Boggle:
    """A Boggle solver that finds all valid words in an NxN grid."""

    def __init__(self, grid, dictionary):
        self.grid = grid
        self.dictionary = dictionary
        self.solutions = []

    def getSolution(self):
        """Return all valid words found in the grid."""
        # Check input parameters are valid
        if self.grid is None or self.dictionary is None:
            return self.solutions

        # Check if grid is NxN
        n = len(self.grid)
        for row in self.grid:
            if len(row) != n:
                return self.solutions

        # Convert input data into the same case
        self.convert_case_to_lower(self.grid, self.dictionary)

        # Check if grid is valid
        if not self.is_grid_valid(self.grid):
            return self.solutions

        # Setup all data structures
        solution_set = set()
        hash_map = self.create_hash_map(self.dictionary)

        # Iterate over the grid to find all words
        for y in range(n):
            for x in range(n):
                word = ""
                visited = [[False for _ in range(n)] for _ in range(n)]
                self.find_words(
                    word, y, x, self.grid, visited, hash_map, solution_set
                )

        self.solutions = list(solution_set)
        return self.solutions

    def find_words(self, word, y, x, grid, visited, hash_map, solution_set):
        """Recursive helper function to explore words in the grid."""
        if y < 0 or x < 0 or y >= len(grid) or x >= len(grid) or visited[y][x]:
            return

        word += grid[y][x]

        # Check if prefix exists
        if word not in hash_map["prefixes"]:
            return

        visited[y][x] = True

        # Add valid word to the solution set
        if len(word) >= 3 and word in hash_map["words"]:
            solution_set.add(word)

        # Explore neighbors
        for dy in range(-1, 2):
            for dx in range(-1, 2):
                if dy == 0 and dx == 0:
                    continue
                self.find_words(
                    word, y + dy, x + dx, grid, visited, hash_map, solution_set
                )

        visited[y][x] = False

    def convert_case_to_lower(self, grid, dictionary):
        """Convert all letters in grid and dictionary to lowercase."""
        for i in range(len(grid)):
            for j in range(len(grid[i])):
                self.grid[i][j] = grid[i][j].lower()
        for i in range(len(dictionary)):
            self.dictionary[i] = dictionary[i].lower()

    def is_grid_valid(self, grid):
        """Return True if all cells contain only alphabetic characters."""
        for row in grid:
            for cell in row:
                if not cell.isalpha():
                    return False
        return True

    def create_hash_map(self, dictionary):
        """Create a hash map containing valid words and prefixes."""
        words = set(dictionary)
        prefixes = set()
        for word in dictionary:
            for i in range(1, len(word) + 1):
                prefixes.add(word[:i])
        return {"words": words, "prefixes": prefixes}


def main():
    """Run a sample Boggle game."""
    grid = [
        ["T", "W", "Y", "R"],
        ["E", "N", "P", "H"],
        ["G", "Z", "Qu", "R"],
        ["O", "N", "T", "A"]
    ]
    dictionary = [
        "art", "ego", "gent", "get", "net", "new", "newt", "prat", "pry",
        "qua", "quart", "quartz", "rat", "tar", "tarp", "ten", "went",
        "wet", "arty", "rhr", "not", "quar"
    ]

    mygame = Boggle(grid, dictionary)
    print(mygame.getSolution())


if __name__ == "__main__":
    main()
